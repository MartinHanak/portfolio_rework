using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace API.Controllers;


[ApiController]
[Route("[controller]")]
public class VideoController : ControllerBase
{
    private readonly string videosDirPath = Path.Combine(Directory.GetCurrentDirectory(), "static", "videos");

    public VideoController() { }

    [HttpPost("UploadVideo")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        var filePath = Path.Combine(videosDirPath, file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { filePath });
    }

    [HttpGet("VideoNames")]
    public async Task<ActionResult<IEnumerable<string>>> GetFileNames()
    {
        var filePaths = await Task.Run(() => Directory.GetFiles(videosDirPath));

        var fileNames = filePaths.Select(Path.GetFileName).ToList();

        return Ok(fileNames);
    }

    [HttpGet("StreamVideo")]
    [Produces("application/octet-stream")]
    public async Task<IActionResult> StreamVideo(string fileName)
    {
        var filePath = Path.Combine(videosDirPath, fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound($"Video file '{fileName}' not found.");
        }

        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);

        // Try to get the content type based on the file extension
        var provider = new FileExtensionContentTypeProvider();
        string contentType;
        if (!provider.TryGetContentType(filePath, out contentType))
        {
            contentType = "application/octet-stream"; // Fallback to a default content type
        }

        try
        {
            long fileLength = fileStream.Length;
            long start = 0;
            long end = fileLength - 1;

            if (Request.Headers.ContainsKey("Range"))
            {
                var range = Request.Headers["Range"].ToString();
                var rangeValues = range.Replace("bytes=", "").Split('-');

                start = long.Parse(rangeValues[0]);
                if (rangeValues.Length > 1 && !string.IsNullOrEmpty(rangeValues[1]))
                {
                    end = long.Parse(rangeValues[1]);
                }

                if (start >= fileLength || end >= fileLength)
                {
                    throw new ArgumentOutOfRangeException("Range header is out of file bound.");
                }
            }

            long contentLength = end - start + 1;
            var contentRange = $"bytes {start}-{end}/{fileLength}";

            Response.Headers.Append("Accept-Ranges", "bytes");
            Response.Headers.Append("Content-Range", contentRange);
            Response.Headers.Append("X-Total-Size", fileStream.ToString());
            Response.ContentLength = contentLength;
            Response.ContentType = contentType;

            fileStream.Seek(start, SeekOrigin.Begin);

            return File(fileStream, contentType, enableRangeProcessing: true);
        }
        catch (ArgumentOutOfRangeException _)
        {
            return StatusCode(416);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error streaming file: {ex.Message}");
        }
    }

}