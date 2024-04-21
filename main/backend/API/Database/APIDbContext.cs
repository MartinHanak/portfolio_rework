
using Microsoft.EntityFrameworkCore;

namespace API;

public class APIDbContext : DbContext
{
    public DbSet<Comment> Comments { get; set; }

    public APIDbContext(DbContextOptions<APIDbContext> options) : base(options)
    {
    }
}