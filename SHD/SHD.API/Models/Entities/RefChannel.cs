using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class RefChannel
{
    public int ChannelId { get; set; }

    public string Label { get; set; } = null!;

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
