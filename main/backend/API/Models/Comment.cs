namespace API;
public class Comment
{
    public int Id { get; set; }
    public required string CommentText { get; set; }
    public string? Username { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    public static Comment FromDto(CommentDto commentDto)
    {
        return new Comment
        {
            CommentText = commentDto.CommentText,
            Username = commentDto.Username
        };
    }
}