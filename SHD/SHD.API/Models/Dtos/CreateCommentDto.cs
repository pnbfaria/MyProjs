namespace SHD.API.Models.Dtos;

public class CreateCommentDto
{
    public int FeedbackId { get; set; }
    public string Content { get; set; } = null!;
    public int? AuthorUserId { get; set; }
}
