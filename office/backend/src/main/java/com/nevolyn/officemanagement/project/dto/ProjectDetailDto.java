package com.nevolyn.officemanagement.project.dto;

import com.nevolyn.officemanagement.development.dto.DevelopmentRecordDto;
import com.nevolyn.officemanagement.experiment.dto.ExperimentDto;
import com.nevolyn.officemanagement.file.dto.FileDto;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import lombok.Builder;

import java.util.List;

/**
 * Composite data transfer record aggregating a full project workspace view,
 * containing project attributes, tasks, research experiments, dev records, and attachments.
 */
@Builder
public record ProjectDetailDto(
        ProjectDto project,
        List<TaskDto> tasks,
        List<ExperimentDto> experiments,
        List<DevelopmentRecordDto> developmentRecords,
        List<FileDto> files
) {}
