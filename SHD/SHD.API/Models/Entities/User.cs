using System;
using System.Collections.Generic;

namespace SHD.API.Models.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Role { get; set; }

    public int? OrgUnitId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByUserId { get; set; }

    public virtual ICollection<Comment> CommentAuthorUsers { get; set; } = new List<Comment>();

    public virtual ICollection<Comment> CommentUpdatedByUsers { get; set; } = new List<Comment>();

    public virtual ICollection<Document> DocumentCreatedByUsers { get; set; } = new List<Document>();

    public virtual ICollection<Document> DocumentUpdatedByUsers { get; set; } = new List<Document>();

    public virtual ICollection<Feedback> FeedbackCreatedByUsers { get; set; } = new List<Feedback>();

    public virtual ICollection<Feedback> FeedbackUpdatedByUsers { get; set; } = new List<Feedback>();

    public virtual ICollection<Interaction> InteractionCreatedByUsers { get; set; } = new List<Interaction>();

    public virtual ICollection<Interaction> InteractionUpdatedByUsers { get; set; } = new List<Interaction>();

    public virtual ICollection<User> InverseUpdatedByUser { get; set; } = new List<User>();

    public virtual OrgUnit? OrgUnit { get; set; }

    public virtual ICollection<Task> TaskAssignedToUsers { get; set; } = new List<Task>();

    public virtual ICollection<Task> TaskCreatedByUsers { get; set; } = new List<Task>();

    public virtual ICollection<Task> TaskUpdatedByUsers { get; set; } = new List<Task>();

    public virtual User? UpdatedByUser { get; set; }
}
