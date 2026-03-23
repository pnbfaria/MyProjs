using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Interaction
{
    public int InteractionId { get; set; }

    public int FeedbackId { get; set; }

    public string? InteractionType { get; set; }

    public string? Description { get; set; }

    public DateTime? InteractionDate { get; set; }

    public int? CreatedByUserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual User? CreatedByUser { get; set; }

    public virtual Feedback Feedback { get; set; } = null!;

    public virtual User? UpdatedByUser { get; set; }
}
