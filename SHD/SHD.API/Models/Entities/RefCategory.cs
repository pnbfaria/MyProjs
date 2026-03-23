using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class RefCategory
{
    public int CategoryId { get; set; }

    public int? ParentCategoryId { get; set; }

    public string Label { get; set; } = null!;

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<RefCategory> InverseParentCategory { get; set; } = new List<RefCategory>();

    public virtual RefCategory? ParentCategory { get; set; }
}
