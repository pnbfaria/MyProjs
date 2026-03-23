using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class RefSubject
{
    public int SubjectId { get; set; }

    public string Label { get; set; } = null!;

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
