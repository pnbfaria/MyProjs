namespace SHD.API.Models.Dtos;

public class CreateTaskDto
{
    public int FeedbackId { get; set; }
    public string TaskName { get; set; } = null!;
    public int? AssignedToUserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? StatusId { get; set; }
    public bool IsHighPriority { get; set; }
    public string? Description { get; set; }
}
