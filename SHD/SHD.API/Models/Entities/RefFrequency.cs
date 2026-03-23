using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class RefFrequency
{
    public int FrequencyLevel { get; set; }

    public string Label { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
