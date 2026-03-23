using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public string FeedbackNumber { get; set; } = null!;

    public int? TypeId { get; set; }

    public int? SubjectId { get; set; }

    public int? CategoryId { get; set; }

    public int? ChannelId { get; set; }

    public int? PlaceId { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public string? Description { get; set; }

    public int? ClientMoodScore { get; set; }

    public bool? IsLitigation { get; set; }

    public int? StatusId { get; set; }

    public int? SeverityId { get; set; }

    public int? FrequencyId { get; set; }

    public int? ClientId { get; set; }

    public int? CreatedByUserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual RefCategory? Category { get; set; }

    public virtual RefChannel? Channel { get; set; }

    public virtual Client? Client { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual RefFrequency? Frequency { get; set; }

    public virtual ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();

    public virtual RefPlace? Place { get; set; }

    public virtual RefSeverity? Severity { get; set; }

    public virtual RefStatus? Status { get; set; }

    public virtual RefSubject? Subject { get; set; }

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

    public virtual RefType? Type { get; set; }

    public virtual User? UpdatedByUser { get; set; }

    public virtual ICollection<OrgUnit> OrgUnits { get; set; } = new List<OrgUnit>();

    public virtual ICollection<RefVisibility> Visibilities { get; set; } = new List<RefVisibility>();
}
