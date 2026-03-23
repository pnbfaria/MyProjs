using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Client
{
    public int ClientId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public bool? IsRequerant { get; set; }

    public int? TerminationThreatCount { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
