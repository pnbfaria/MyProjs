using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using SHD.API.Models.Entities;

namespace SHD.API.Data;

public partial class ShdDbContext : DbContext
{
    public ShdDbContext()
    {
    }

    public ShdDbContext(DbContextOptions<ShdDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Interaction> Interactions { get; set; }

    public virtual DbSet<OrgUnit> OrgUnits { get; set; }

    public virtual DbSet<RefCategory> RefCategories { get; set; }

    public virtual DbSet<RefChannel> RefChannels { get; set; }

    public virtual DbSet<RefFrequency> RefFrequencies { get; set; }

    public virtual DbSet<RefPlace> RefPlaces { get; set; }

    public virtual DbSet<RefSeverity> RefSeverities { get; set; }

    public virtual DbSet<RefStatus> RefStatuses { get; set; }

    public virtual DbSet<RefSubject> RefSubjects { get; set; }

    public virtual DbSet<RefType> RefTypes { get; set; }

    public virtual DbSet<RefVisibility> RefVisibilities { get; set; }

    public virtual DbSet<SHD.API.Models.Entities.Task> Tasks { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.ClientId).HasName("PK__CLIENTS__BF21A424B878EF3D");

            entity.ToTable("CLIENTS");

            entity.Property(e => e.ClientId)
                .ValueGeneratedNever()
                .HasColumnName("client_id");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("first_name");
            entity.Property(e => e.IsRequerant)
                .HasDefaultValue(false)
                .HasColumnName("is_requerant");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("last_name");
            entity.Property(e => e.TerminationThreatCount)
                .HasDefaultValue(0)
                .HasColumnName("termination_threat_count");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__COMMENTS__E79576872ED96742");

            entity.ToTable("COMMENTS");

            entity.Property(e => e.CommentId).HasColumnName("comment_id");
            entity.Property(e => e.AuthorUserId).HasColumnName("author_user_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.AuthorUser).WithMany(p => p.CommentAuthorUsers)
                .HasForeignKey(d => d.AuthorUserId)
                .HasConstraintName("FK_Comments_Author");

            entity.HasOne(d => d.Feedback).WithMany(p => p.Comments)
                .HasForeignKey(d => d.FeedbackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comments_Feedback");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.CommentUpdatedByUsers)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Comments_UpdatedBy");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.DocumentId).HasName("PK__DOCUMENT__9666E8AC3193D857");

            entity.ToTable("DOCUMENTS");

            entity.Property(e => e.DocumentId).HasColumnName("document_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.DocType)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("doc_type");
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("file_name");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.DocumentCreatedByUsers)
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("FK_Documents_CreatedBy");

            entity.HasOne(d => d.Feedback).WithMany(p => p.Documents)
                .HasForeignKey(d => d.FeedbackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Documents_Feedback");

            entity.HasOne(d => d.Status).WithMany(p => p.Documents)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK_Documents_Status");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.DocumentUpdatedByUsers)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Documents_UpdatedBy");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__FEEDBACK__7A6B2B8C37CD7E49");

            entity.ToTable("FEEDBACKS");

            entity.HasIndex(e => e.FeedbackNumber, "UQ__FEEDBACK__B903CD9A4E29D555").IsUnique();

            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.ChannelId).HasColumnName("channel_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.ClientMoodScore).HasColumnName("client_mood_score");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FeedbackNumber)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("feedback_number");
            entity.Property(e => e.FrequencyId).HasColumnName("frequency_id");
            entity.Property(e => e.IsLitigation)
                .HasDefaultValue(false)
                .HasColumnName("is_litigation");
            entity.Property(e => e.PlaceId).HasColumnName("place_id");
            entity.Property(e => e.ReceivedDate)
                .HasColumnType("datetime")
                .HasColumnName("received_date");
            entity.Property(e => e.SeverityId).HasColumnName("severity_id");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TypeId).HasColumnName("type_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.Category).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Feedbacks_Category");

            entity.HasOne(d => d.Channel).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ChannelId)
                .HasConstraintName("FK_Feedbacks_Channel");

            entity.HasOne(d => d.Client).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ClientId)
                .HasConstraintName("FK_Feedbacks_Client");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.FeedbackCreatedByUsers)
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("FK_Feedbacks_CreatedBy");

            entity.HasOne(d => d.Frequency).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.FrequencyId)
                .HasConstraintName("FK_Feedbacks_Frequency");

            entity.HasOne(d => d.Place).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.PlaceId)
                .HasConstraintName("FK_Feedbacks_Place");

            entity.HasOne(d => d.Severity).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.SeverityId)
                .HasConstraintName("FK_Feedbacks_Severity");

            entity.HasOne(d => d.Status).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK_Feedbacks_Status");

            entity.HasOne(d => d.Subject).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK_Feedbacks_Subject");

            entity.HasOne(d => d.Type).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.TypeId)
                .HasConstraintName("FK_Feedbacks_Type");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.FeedbackUpdatedByUsers)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Feedbacks_UpdatedBy");

            entity.HasMany(d => d.OrgUnits).WithMany(p => p.Feedbacks)
                .UsingEntity<Dictionary<string, object>>(
                    "FeedbackOrgUnit",
                    r => r.HasOne<OrgUnit>().WithMany()
                        .HasForeignKey("OrgUnitId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_FOU_OrgUnit"),
                    l => l.HasOne<Feedback>().WithMany()
                        .HasForeignKey("FeedbackId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_FOU_Feedback"),
                    j =>
                    {
                        j.HasKey("FeedbackId", "OrgUnitId").HasName("PK__FEEDBACK__FA3D300AB935801D");
                        j.ToTable("FEEDBACK_ORG_UNITS");
                        j.IndexerProperty<int>("FeedbackId").HasColumnName("feedback_id");
                        j.IndexerProperty<int>("OrgUnitId").HasColumnName("org_unit_id");
                    });

            entity.HasMany(d => d.Visibilities).WithMany(p => p.Feedbacks)
                .UsingEntity<Dictionary<string, object>>(
                    "FeedbackVisibility",
                    r => r.HasOne<RefVisibility>().WithMany()
                        .HasForeignKey("VisibilityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_FV_Visibility"),
                    l => l.HasOne<Feedback>().WithMany()
                        .HasForeignKey("FeedbackId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_FV_Feedback"),
                    j =>
                    {
                        j.HasKey("FeedbackId", "VisibilityId").HasName("PK__FEEDBACK__D8458ADE54BA62C1");
                        j.ToTable("FEEDBACK_VISIBILITY");
                        j.IndexerProperty<int>("FeedbackId").HasColumnName("feedback_id");
                        j.IndexerProperty<int>("VisibilityId").HasColumnName("visibility_id");
                    });
        });

        modelBuilder.Entity<Interaction>(entity =>
        {
            entity.HasKey(e => e.InteractionId).HasName("PK__INTERACT__605F8FE65091971C");

            entity.ToTable("INTERACTIONS");

            entity.Property(e => e.InteractionId).HasColumnName("interaction_id");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.InteractionDate)
                .HasColumnType("datetime")
                .HasColumnName("interaction_date");
            entity.Property(e => e.InteractionType)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("interaction_type");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.InteractionCreatedByUsers)
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("FK_Interactions_CreatedBy");

            entity.HasOne(d => d.Feedback).WithMany(p => p.Interactions)
                .HasForeignKey(d => d.FeedbackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Interactions_Feedback");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.InteractionUpdatedByUsers)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Interactions_UpdatedBy");
        });

        modelBuilder.Entity<OrgUnit>(entity =>
        {
            entity.HasKey(e => e.OrgUnitId).HasName("PK__ORG_UNIT__0561B869C395B194");

            entity.ToTable("ORG_UNITS");

            entity.Property(e => e.OrgUnitId)
                .ValueGeneratedNever()
                .HasColumnName("org_unit_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<RefCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__REF_CATE__D54EE9B4C3D5D30A");

            entity.ToTable("REF_CATEGORY");

            entity.Property(e => e.CategoryId)
                .ValueGeneratedNever()
                .HasColumnName("category_id");
            entity.Property(e => e.Label)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("label");
            entity.Property(e => e.ParentCategoryId).HasColumnName("parent_category_id");

            entity.HasOne(d => d.ParentCategory).WithMany(p => p.InverseParentCategory)
                .HasForeignKey(d => d.ParentCategoryId)
                .HasConstraintName("FK_RefCategory_Parent");
        });

        modelBuilder.Entity<RefChannel>(entity =>
        {
            entity.HasKey(e => e.ChannelId).HasName("PK__REF_CHAN__2D0861AB10B87ACA");

            entity.ToTable("REF_CHANNEL");

            entity.Property(e => e.ChannelId).HasColumnName("channel_id");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefFrequency>(entity =>
        {
            entity.HasKey(e => e.FrequencyLevel).HasName("PK__REF_FREQ__CA7957A54F43D825");

            entity.ToTable("REF_FREQUENCY");

            entity.Property(e => e.FrequencyLevel)
                .ValueGeneratedNever()
                .HasColumnName("frequency_level");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefPlace>(entity =>
        {
            entity.HasKey(e => e.PlaceId).HasName("PK__REF_PLAC__BF2B684A09B0A965");

            entity.ToTable("REF_PLACE");

            entity.Property(e => e.PlaceId).HasColumnName("place_id");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefSeverity>(entity =>
        {
            entity.HasKey(e => e.SeverityLevel).HasName("PK__REF_SEVE__001248AD2CD96120");

            entity.ToTable("REF_SEVERITY");

            entity.Property(e => e.SeverityLevel)
                .ValueGeneratedNever()
                .HasColumnName("severity_level");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__REF_STAT__3683B5319C7E95EA");

            entity.ToTable("REF_STATUS");

            entity.Property(e => e.StatusId)
                .ValueGeneratedNever()
                .HasColumnName("status_id");
            entity.Property(e => e.AppliesTo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("applies_to");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefSubject>(entity =>
        {
            entity.HasKey(e => e.SubjectId).HasName("PK__REF_SUBJ__5004F660D9F80F6C");

            entity.ToTable("REF_SUBJECT");

            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.Label)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefType>(entity =>
        {
            entity.HasKey(e => e.TypeId).HasName("PK__REF_TYPE__2C000598150F9086");

            entity.ToTable("REF_TYPE");

            entity.Property(e => e.TypeId).HasColumnName("type_id");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<RefVisibility>(entity =>
        {
            entity.HasKey(e => e.VisibilityId).HasName("PK__REF_VISI__22EA152B916FF215");

            entity.ToTable("REF_VISIBILITY");

            entity.Property(e => e.VisibilityId).HasColumnName("visibility_id");
            entity.Property(e => e.Label)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("label");
        });

        modelBuilder.Entity<SHD.API.Models.Entities.Task>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__TASKS__0492148DD0346E17");

            entity.ToTable("TASKS");

            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.AssignedToUserId).HasColumnName("assigned_to_user_id");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.DueDate)
                .HasColumnType("datetime")
                .HasColumnName("due_date");
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.IsHighPriority)
                .HasDefaultValue(false)
                .HasColumnName("is_high_priority");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.TaskName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("task_name");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.AssignedToUser).WithMany(p => p.TaskAssignedToUsers)
                .HasForeignKey(d => d.AssignedToUserId)
                .HasConstraintName("FK_Tasks_AssignedTo");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.TaskCreatedByUsers)
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("FK_Tasks_CreatedBy");

            entity.HasOne(d => d.Feedback).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.FeedbackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tasks_Feedback");

            entity.HasOne(d => d.Status).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK_Tasks_Status");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.TaskUpdatedByUsers)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Tasks_UpdatedBy");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USERS__B9BE370F9C5F6782");

            entity.ToTable("USERS");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("last_name");
            entity.Property(e => e.OrgUnitId).HasColumnName("org_unit_id");
            entity.Property(e => e.Role)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");

            entity.HasOne(d => d.OrgUnit).WithMany(p => p.Users)
                .HasForeignKey(d => d.OrgUnitId)
                .HasConstraintName("FK_Users_OrgUnit");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.InverseUpdatedByUser)
                .HasForeignKey(d => d.UpdatedByUserId)
                .HasConstraintName("FK_Users_UpdatedBy");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
