using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Task
{
    public int TaskId { get; set; }

    public int FeedbackId { get; set; }

    public string TaskName { get; set; } = null!;

    public int? CreatedByUserId { get; set; }

    public int? AssignedToUserId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? DueDate { get; set; }

    public int? StatusId { get; set; }

    public bool? IsHighPriority { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual User? AssignedToUser { get; set; }

    public virtual User? CreatedByUser { get; set; }

    public virtual Feedback Feedback { get; set; } = null!;

    public virtual RefStatus? Status { get; set; }

    public virtual User? UpdatedByUser { get; set; }
}
