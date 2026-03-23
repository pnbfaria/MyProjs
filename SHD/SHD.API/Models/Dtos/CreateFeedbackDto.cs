namespace SHD.API.Models.Dtos;

public class CreateFeedbackDto
{
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

    // Many-to-many IDs
    public List<int> OrgUnitIds { get; set; } = new();
    public List<int> VisibilityIds { get; set; } = new();
}
