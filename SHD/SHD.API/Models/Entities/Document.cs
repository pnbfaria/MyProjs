using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Document
{
    public int DocumentId { get; set; }

    public int FeedbackId { get; set; }

    public string FileName { get; set; } = null!;

    public string? DocType { get; set; }

    public int? StatusId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? CreatedByUserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual User? CreatedByUser { get; set; }

    public virtual Feedback Feedback { get; set; } = null!;

    public virtual RefStatus? Status { get; set; }

    public virtual User? UpdatedByUser { get; set; }
}
