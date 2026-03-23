using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class OrgUnit
{
    public int OrgUnitId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
