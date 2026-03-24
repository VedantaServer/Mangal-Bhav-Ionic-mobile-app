using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace FaceUPAI.Controllers.Common
{
    [Route("[controller]")]
    [ApiController]
    public class aiAttendanceController : Controller
    {
        private readonly HttpClient _httpClient;

        public aiAttendanceController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpGet]
        public IActionResult Index()
        {
            return Ok("✅ AI Attendance API running - use POST /aiAttendance/MarkAttendanceByGroupPhoto or /aiAttendance/MarkAttendanceByVideo");
        }

        [EnableCors("AllowAll")]
        [HttpPost("MarkAttendanceByGroupPhoto")]
        public async Task<IActionResult> MarkAttendanceByGroupPhoto([FromForm] IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return BadRequest("Please upload a valid photo.");

            try
            {
                using var content = new MultipartFormDataContent();
                using var stream = photo.OpenReadStream();
                content.Add(new StreamContent(stream), "file", photo.FileName);

                // Forward image to Python FastAPI
                var response = await _httpClient.PostAsync("http://localhost:5000/recognize", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { error = $"Python service error: {errorMsg}" });
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<FaceRecognitionResponse>(jsonString);

                // Convert recognized faces to attendance list
                var attendanceList = result?.Recognized?.ConvertAll(recognized => new AttendanceRecord
                {
                    ImageID = recognized.Name,
                    Confidence = recognized.Confidence,
                    AttendanceMarkedAt = DateTime.Now,
                    Source = "AI Group Photo"
                }) ?? new List<AttendanceRecord>();

                // Return both attendance list + annotated image
                return Ok(new
                {
                    message = "✅ Attendance marked successfully",
                    totalRecognized = attendanceList.Count,
                    facesDetected = result?.FacesDetected ?? 0,
                    data = attendanceList,
                    annotatedImage = result?.AnnotatedImage // base64 image from Python
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }



        [EnableCors("AllowAll")]
        [HttpPost("MarkAttendanceByVideo")]
        public async Task<IActionResult> MarkAttendanceByVideo([FromForm] IFormFile video, [FromForm] int frameSkip = 5)
        {
            if (video == null || video.Length == 0)
                return BadRequest("Please upload a valid video file.");

            try
            {
                using var content = new MultipartFormDataContent();
                using var stream = video.OpenReadStream();
                var streamContent = new StreamContent(stream);
                streamContent.Headers.ContentType =
                    new System.Net.Http.Headers.MediaTypeHeaderValue(video.ContentType ?? "application/octet-stream");

                content.Add(streamContent, "file", video.FileName);
                content.Add(new StringContent(frameSkip.ToString()), "frame_skip");

                var response = await _httpClient.PostAsync("http://localhost:5000/recognize_video", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { error = $"Python service error: {errorMsg}" });
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                var videoResult = JsonConvert.DeserializeObject<FaceRecognitionVideoResponse>(jsonString);

                // build attendance list
                var attendanceList = new List<AttendanceRecord>();
                if (videoResult?.Recognized != null)
                {
                    foreach (var recognized in videoResult.Recognized)
                    {
                        double ts = (recognized.Timestamps != null && recognized.Timestamps.Count > 0)
                                    ? recognized.Timestamps[0] : -1;

                        attendanceList.Add(new AttendanceRecord
                        {
                            ImageID = recognized.Name,
                            Confidence = recognized.BestConfidence,
                            AttendanceMarkedAt = DateTime.Now,
                            FirstSeenSec = ts >= 0 ? ts : (double?)null,
                            Source = "AI Video"
                        });
                    }
                }

                return Ok(new
                {
                    message = "✅ Attendance marked successfully (video)",
                    totalRecognized = attendanceList.Count,
                    facesDetected = videoResult?.FacesDetected ?? 0,
                    uniqueFaces = videoResult?.UniqueFaces ?? 0,

                    // NEW — only single combined collage image.
                    facesSummaryImage = videoResult?.FacesSummaryImage,

                    // attendance data
                    data = attendanceList
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        // ---------------------------------------------
        // 🔹 Models (existing + video response)
        // ---------------------------------------------
    }

    // Image response model (existing)
    public class FaceRecognitionResponse
    {
        [JsonProperty("recognized")]
        public List<RecognizedFace> Recognized { get; set; }

        [JsonProperty("faces_detected")]
        public int FacesDetected { get; set; }

        [JsonProperty("annotated_image")]
        public string AnnotatedImage { get; set; }
    }

    public class RecognizedFace
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("confidence")]
        public double Confidence { get; set; }

        [JsonProperty("bbox")]
        public List<float> Bbox { get; set; }
    }

    // Video response model (new)
    public class FaceRecognitionVideoResponse
    {
        [JsonProperty("recognized")]
        public List<RecognizedPerson> Recognized { get; set; }

        [JsonProperty("faces_detected")]
        public int FacesDetected { get; set; }

        [JsonProperty("unique_faces")]
        public int UniqueFaces { get; set; }


        [JsonProperty("faces_summary_image")]
        public string FacesSummaryImage { get; set; } // ✔ single collage image
    }



    public class RecognizedPerson
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        // Python returns "best_confidence" in the example code
        [JsonProperty("best_confidence")]
        public double BestConfidence { get; set; }

        [JsonProperty("timestamps")]
        public List<double> Timestamps { get; set; }

        [JsonProperty("bboxes")]
        public List<List<int>> Bboxes { get; set; }
    }

    // Attendance record (extended with optional FirstSeenSec for video)
    public class AttendanceRecord
    {
        public string ImageID { get; set; }
        public double Confidence { get; set; }
        public DateTime AttendanceMarkedAt { get; set; }
        public string Source { get; set; }

        // optional: for video we include the first seen timestamp (seconds into video)
        public double? FirstSeenSec { get; set; }
    }
}
