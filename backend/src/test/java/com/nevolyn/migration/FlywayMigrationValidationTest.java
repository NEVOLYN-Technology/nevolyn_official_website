package com.nevolyn.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that the Flyway migrations in {@code db/migration} produce a schema
 * the JPA entities actually map onto.
 *
 * <h2>Why this test exists</h2>
 * Production runs {@code ddl-auto=validate}, so Hibernate creates nothing — the
 * migrations are the single source of truth for the schema. A typo in the SQL
 * therefore surfaces as a startup failure on the deployed instance, which is a
 * bad place to discover it. This test moves that failure into CI.
 *
 * <p>
 * Loading the context under the {@code migration-test} profile runs the real
 * migration files and then asks Hibernate to validate every entity against the
 * result. If a column is misnamed, missing, or has the wrong nullability, the
 * context fails to start and this test fails with it. The explicit assertions
 * below then confirm the tables and the snake_case naming that Spring's default
 * strategy expects.
 *
 * <h2>Limitation</h2>
 * This runs against H2 in PostgreSQL compatibility mode, not PostgreSQL. It
 * validates the entity-to-schema mapping, not PostgreSQL-specific syntax.
 *
 * @author NEVOLYN Technology Engineering
 */
@SpringBootTest
@ActiveProfiles("migration-test")
class FlywayMigrationValidationTest {

    @Autowired
    private DataSource dataSource;

    @Test
    @DisplayName("Flyway migrations apply cleanly and satisfy Hibernate entity validation")
    void migrationsProduceSchemaMatchingEntities() throws Exception {
        // Reaching this point already proves the important part: the application
        // context started, which means Flyway migrated successfully AND
        // ddl-auto=validate accepted every entity mapping.
        Set<String> tables = fetchTableNames();

        assertThat(tables)
                .as("all entity tables created by V1__initial_schema.sql")
                .contains("contact_inquiries", "job_applications");

        assertThat(tables)
                .as("Flyway records applied migrations in its history table")
                .contains("flyway_schema_history");

        // This database stores submissions only. The team roster is static
        // content in frontend/lib/data/team.ts and must not gain a table here.
        assertThat(tables)
                .as("team roster is static frontend content, not database state")
                .doesNotContain("team_members");
    }

    @Test
    @DisplayName("Camel-case entity fields map to snake_case columns")
    void columnsUseSnakeCaseNaming() throws Exception {
        // Spring Boot's CamelCaseToUnderscoresNamingStrategy turns inquiryId into
        // inquiry_id. Hand-written DDL is the one place that convention can be
        // broken silently, so assert the columns most likely to be got wrong.
        assertThat(fetchColumnNames("contact_inquiries"))
                .contains("inquiry_id", "is_verified", "verified_at", "created_at", "verification_token");

        assertThat(fetchColumnNames("job_applications"))
                .contains("application_id", "resume_path", "original_file_name", "is_verified");
    }

    /** Returns every table name in the connected schema, lower-cased. */
    private Set<String> fetchTableNames() throws Exception {
        Set<String> tables = new HashSet<>();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    tables.add(rs.getString("TABLE_NAME").toLowerCase());
                }
            }
        }
        return tables;
    }

    /** Returns every column name of {@code tableName}, lower-cased. */
    private Set<String> fetchColumnNames(String tableName) throws Exception {
        Set<String> columns = new HashSet<>();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (ResultSet rs = metaData.getColumns(null, null, "%", "%")) {
                while (rs.next()) {
                    if (tableName.equalsIgnoreCase(rs.getString("TABLE_NAME"))) {
                        columns.add(rs.getString("COLUMN_NAME").toLowerCase());
                    }
                }
            }
        }
        return columns;
    }
}
