using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class RefStatus
{
    public int StatusId { get; set; }

    public string Label { get; set; } = null!;

    public string? AppliesTo { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
}
