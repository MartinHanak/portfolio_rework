using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class CommentController : ControllerBase
{
    private readonly APIDbContext _context;
    public CommentController(APIDbContext context)
    {
        _context = context;
    }

    [HttpGet(Name = "GetComments")]
    public async Task<ActionResult<List<Comment>>> GetComments()
    {
        var comments = await _context.Comments.ToListAsync();

        return Ok(comments);
    }

    [HttpPost(Name = "PostComment")]
    public async Task<ActionResult<Comment>> PostComment([FromBody] CommentDto commentDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var comment = Comment.FromDto(commentDto);

        _context.Add(comment);

        var success = await _context.SaveChangesAsync() > 0;

        if (success) return CreatedAtRoute("PostComment", comment);

        return BadRequest(new ProblemDetails { Title = "Problem saving comment to database" });
    }

}