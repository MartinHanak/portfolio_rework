using API;
using Microsoft.EntityFrameworkCore;

var AllowAllOrigins = "_origins";
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// CORS setup
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowAllOrigins, builder =>
        builder.
        AllowAnyOrigin().
        AllowAnyHeader().
        AllowAnyMethod()
    );
});

// Database setup
builder.Services.AddDbContext<APIDbContext>(options =>
    options.UseSqlServer(
        Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(AllowAllOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
