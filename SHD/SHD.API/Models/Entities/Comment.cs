using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Comment
{
    public int CommentId { get; set; }

    public int FeedbackId { get; set; }

    public int? AuthorUserId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual User? AuthorUser { get; set; }

    public virtual Feedback Feedback { get; set; } = null!;

    public virtual User? UpdatedByUser { get; set; }
}
