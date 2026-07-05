using FaceUPAI.DataAccessService;
using FaceUPAI.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlTypes;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using static FaceUPAI.CommonServices;

namespace FaceUPAI.API
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class MangalBhavKYCController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _baseUrl;

        public MangalBhavKYCController(
            IConfiguration config,
            IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
            _config = config;

            _clientId = _config["Cashfree:ClientId"];
            _clientSecret = _config["Cashfree:ClientSecret"];
            _baseUrl = _config["Cashfree:BaseUrl"];
        }

        // =========================================================
        // 1. GENERATE AUTHENTICATION URL (DigiLocker)
        // =========================================================


        // =========================================================
        // 1. GENERATE AUTHENTICATION URL
        // =========================================================


        // Replace KYCAuthRequest with this
        public class MBKYCAuthRequest
        {
            // ── Cashfree fields (snake_case — passed directly) ──
            public string verification_id { get; set; }
            public string[] document_requested { get; set; }
            public string redirect_url { get; set; }
            public string user_flow { get; set; }

            // ── Our DB fields ──
            public int UserID { get; set; }
            public int TenantID { get; set; } = 1;
            public string UpdatedByUser { get; set; }
        }
        [HttpPost("GenerateAuthUrl")]
        public async Task<IActionResult> GenerateAuthUrl([FromBody] MBKYCAuthRequest request)
        {
            try
            {
                Console.WriteLine("[KYC] GenerateAuthUrl REQUEST:");
                Console.WriteLine(JsonConvert.SerializeObject(request));

                if (request == null)
                    return BadRequest(new { message = "Request body is null" });

                if (request.UserID <= 0)
                    return BadRequest(new { message = "UserID is required" });

                var url = $"{_baseUrl}/verification/digilocker";

                var jsonContent = JsonConvert.SerializeObject(new
                {
                    verification_id = request.verification_id,
                    document_requested = request.document_requested,
                    redirect_url = request.redirect_url,
                    user_flow = "signup"
                });

                var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);

                httpRequest.Headers.Add("x-client-id", _clientId);
                httpRequest.Headers.Add("x-client-secret", _clientSecret);
                
                httpRequest.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(httpRequest);
                var responseContent = await response.Content.ReadAsStringAsync();

                // ── RAW LOG ──
                Console.WriteLine($"[KYC] Cashfree Status: {(int)response.StatusCode}");
                Console.WriteLine($"[KYC] Cashfree Raw: {responseContent}");

                // ── EVERYTHING BELOW IS REPLACED ──

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, responseContent);

                dynamic result = JsonConvert.DeserializeObject(responseContent);

                // Capture reference_id Cashfree sends back — only available HERE, never again
                string cashfreeRefId = Convert.ToString(result?.reference_id ?? "");

                Console.WriteLine($"[KYC] reference_id from Cashfree: {cashfreeRefId}");

                // Save BOTH IDs to DB immediately
                SaveKYCRecordSync(new MangalBhavPopularity
                {
                    UserID = request.UserID,
                    TenantID = request.TenantID,
                    IsEKYC = false,
                    IsMBVerified = false,
                    Remarks = $"ReferenceID:{cashfreeRefId}|VerificationID:{request.verification_id}|Status:AUTH_GENERATED",
                    DateAdded = DateTime.Now,
                    DateModified = DateTime.Now,
                    UpdatedByUser = request.UpdatedByUser ?? "System"
                });

                // Return structured object — not raw string
                return Ok(new
                {
                    Status = "Success",
                    VerificationID = request.verification_id,
                    ReferenceID = cashfreeRefId,
                    AuthUrl = result?.url?.ToString(),      // ← correct field
                    ExpiresAt = result?.expiry?.ToString()
                    // RawCashfree removed
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KYC] GenerateAuthUrl ERROR: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
        // =========================================================
        // 2. CHECK CONSENT STATUS & UPDATE MOBILE
        // =========================================================


        [HttpPost("CheckConsentStatus")]
        public async Task<IActionResult> CheckConsentStatus(
    [FromQuery] string referenceId,
    [FromQuery] string verificationId,
    [FromQuery] int userId,
    [FromQuery] int tenantId = 1)
        {
            if (string.IsNullOrEmpty(referenceId) || string.IsNullOrEmpty(verificationId))
                return BadRequest(new { message = "ReferenceID and VerificationID are required." });

            var url = $"{_baseUrl}/verification/digilocker?reference_id={referenceId}&verification_id={verificationId}";
            var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

            httpRequest.Headers.Add("x-client-id", _clientId);
            httpRequest.Headers.Add("x-client-secret", _clientSecret);
            

            var response = await _httpClient.SendAsync(httpRequest);
            var responseContent = await response.Content.ReadAsStringAsync();

            // ── RAW LOG — always keep this
            Console.WriteLine($"[KYC CheckConsent] Raw: {responseContent}");

            dynamic consentRes = JsonConvert.DeserializeObject(responseContent);

            // Extract values with Convert.ToString — handles dynamic arrays safely
            string consentStatus = Convert.ToString(consentRes?.status ?? "");
            string userMobile = Convert.ToString(consentRes?.user_details?.mobile ?? "");

            Console.WriteLine($"[KYC CheckConsent] status={consentStatus}, mobile={userMobile}");

            // Update DB record if mobile available
            var existingRecord = GetKYCRecordByUserIDSync(userId, tenantId);
            if (existingRecord != null && !string.IsNullOrEmpty(userMobile))
            {
                // Preserve existing ReferenceID in Remarks — just append mobile
                existingRecord.Remarks = existingRecord.Remarks?.Contains("ReferenceID") == true
                    ? existingRecord.Remarks.Replace(
                        existingRecord.Remarks.Contains("Status:AUTH_GENERATED")
                            ? "Status:AUTH_GENERATED"
                            : "Status:CALLBACK_RECEIVED",
                        $"Status:CONSENT_CHECKED"
                      ) + $"|Mobile:{userMobile}"
                    : $"Consent checked. Mobile: {userMobile}";

                existingRecord.DateModified = DateTime.Now;
                existingRecord.UpdatedByUser = "KYC_System";
                UpdateKYCRecordSync(existingRecord);
            }

            return StatusCode((int)response.StatusCode, new
            {
                Status = response.IsSuccessStatusCode ? "Success" : "Failed",
                ConsentStatus = consentStatus,              // ← now uses correct field
                UserMobile = userMobile,
                CashfreeResponse = consentRes
            });
        }


        // =========================================================
        // 3. GET DOCUMENT DATA & VERIFY AADHAAR
        // =========================================================

        [HttpPost("GetDocumentData")]
        public async Task<IActionResult> GetDocumentData(
    [FromQuery] string referenceId,
    [FromQuery] string verificationId,
    [FromQuery] string documentType = "AADHAAR",
    [FromQuery] int userId = 0,
    [FromQuery] int tenantId = 1,
    [FromQuery] string updatedByUser = "System")
        {
            try
            {
                if (string.IsNullOrEmpty(referenceId) || string.IsNullOrEmpty(verificationId))
                    return BadRequest(new { message = "ReferenceID and VerificationID are required." });

                // STEP 1 — Fetch document from Cashfree
                var url = $"{_baseUrl}/verification/digilocker/document/{documentType}?reference_id={referenceId}";
                var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

                httpRequest.Headers.Add("x-client-id", _clientId);
                httpRequest.Headers.Add("x-client-secret", _clientSecret);
                // NO x-api-version header

                var response = await _httpClient.SendAsync(httpRequest);
                var responseContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[KYC GetDocumentData] ReferenceID: {referenceId}, VerificationID: {verificationId}, Response: {responseContent}");

                dynamic documentRes = JsonConvert.DeserializeObject(responseContent);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new
                    {
                        Status = "Failed",
                        Message = "Failed to fetch document from Cashfree",
                        CashfreeResponse = documentRes
                    });
                }

                // STEP 2 — Get existing KYC record
                var existingRecord = GetKYCRecordByUserIDSync(userId, tenantId);

                // STEP 3 — Extract fields from Cashfree response
                string verifiedName = Convert.ToString(documentRes?.name ?? "");
                string verifiedGender = Convert.ToString(documentRes?.gender ?? "");
                string verifiedAddress = Convert.ToString(documentRes?.address ?? "");
                string verifiedDOB = Convert.ToString(documentRes?.dob ?? "");
                string aadhaarNumber = Convert.ToString(documentRes?.uid ?? "");
                string photoLink = Convert.ToString(documentRes?.photo_link ?? "");
                string careOf = Convert.ToString(documentRes?.care_of ?? "");

                Console.WriteLine($"[KYC GetDocumentData] Name: {verifiedName}, DOB: {verifiedDOB}, Gender: {verifiedGender}");

                // STEP 4 — Save Aadhaar photo
                string savedPhotoPath = "";
                if (!string.IsNullOrEmpty(photoLink))
                {
                    savedPhotoPath = await SaveAadhaarPhotoAsync(photoLink, verificationId); // ← await
                    Console.WriteLine($"[KYC GetDocumentData] Photo saved: {savedPhotoPath}");
                }

                // STEP 5 — Build KYC record
                var kycRecord = existingRecord ?? new MangalBhavPopularity();
                kycRecord.UserID = userId;
                kycRecord.TenantID = tenantId;
                kycRecord.IsEKYC = true;
                kycRecord.IsMBVerified = false;
                kycRecord.VerifiedName = verifiedName;
                kycRecord.VerifiedAddress = verifiedAddress;
                kycRecord.VerifiedDOB = verifiedDOB;
                kycRecord.VerifiedGender = verifiedGender;
                kycRecord.Remarks = $"Aadhaar verified. Last4: {GetLast4(aadhaarNumber)}. Photo: {savedPhotoPath}";
                kycRecord.Descriptions = $"Aadhaar: {aadhaarNumber}, CareOf: {careOf}";
                kycRecord.DateModified = DateTime.Now;
                kycRecord.UpdatedByUser = updatedByUser;

                if (existingRecord == null)
                    kycRecord.DateAdded = DateTime.Now;

                // STEP 6 — Save to DB
                if (existingRecord != null)
                    UpdateKYCRecordSync(kycRecord);
                else
                    SaveKYCRecordSync(kycRecord);

                // STEP 7 — Update user profile with verified data
                UpdateUserProfileWithKYCSync(userId, verifiedName, verifiedAddress, verifiedDOB, verifiedGender, savedPhotoPath);

                // STEP 8 — Return
                return Ok(new
                {
                    Status = "Success",
                    Message = "KYC verification completed successfully",
                    VerificationStatus = "VERIFIED",
                    VerifiedData = new
                    {
                        Name = verifiedName,
                        Gender = verifiedGender,
                        Address = verifiedAddress,
                        DOB = verifiedDOB,
                        AadhaarLast4 = GetLast4(aadhaarNumber),
                        PhotoSaved = savedPhotoPath
                    },
                    CashfreeResponse = documentRes
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KYC GetDocumentData] ERROR: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }


        private string GetKYCPhotoUrl(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return "";
            return $"/assets/kyc-photos/{fileName}"; // Angular serves from ClientApp/src/assets
        }



        // =========================================================
        // KYC CALLBACK — Cashfree redirects here after DigiLocker
        // Returns HTML page telling user to return to app
        // =========================================================
        [HttpGet("KYCCallback")]
        public IActionResult KYCCallback(
    [FromQuery] string reference_id,
    [FromQuery] string verification_id)
        {
            Console.WriteLine($"[KYC Callback] ref={reference_id}, ver={verification_id}");

            if (!string.IsNullOrEmpty(verification_id))
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@TenantID", 1),
            new SqlParameter("@SchoolID", 0),
            new SqlParameter("@Query", $"Remarks LIKE '%VerificationID:{verification_id}%'")
                };

                MangalBhavPopularity record = null;
                using (SqlDataReader dr = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "MangalBhavPopularitySelectByQuery", parameters))
                {
                    if (dr.Read()) record = MakeMangalBhavPopularity(dr);
                }

                if (record != null)
                {
                    // ── ONLY update Status — keep ReferenceID intact ──
                    record.Remarks = (record.Remarks ?? "")
                        .Replace("Status:AUTH_GENERATED", "Status:CALLBACK_RECEIVED");

                    record.DateModified = DateTime.Now;
                    UpdateKYCRecordSync(record);

                    Console.WriteLine($"[KYC Callback] Updated status. Remarks now: {record.Remarks}");
                }
                else
                {
                    Console.WriteLine($"[KYC Callback] No record found for verification_id={verification_id}");
                }
            }

            // same HTML as before...
            var html = $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>KYC Complete</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .card {{
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            text-align: center;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }}
        .icon {{ font-size: 64px; margin-bottom: 20px; }}
        h1 {{ color: #2d2d2d; font-size: 22px; margin-bottom: 10px; }}
        p {{ color: #666; font-size: 15px; line-height: 1.5; margin-bottom: 24px; }}
        .close-btn {{
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
        }}
        .om {{ color: #ff6b35; font-size: 28px; margin-bottom: 8px; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='om'>🙏</div>
        <div class='icon'>✅</div>
        <h1>Consent Received!</h1>
        <p>Your DigiLocker consent has been completed successfully.<br><br>
        Please <strong>close this browser</strong> and return to the <strong>Mangal Bhav</strong> app to complete KYC.</p>
        <button class='close-btn' onclick='window.close()'>
            Close &amp; Return to App
        </button>
    </div>
</body>
</html>";

            return Content(html, "text/html");
        }

        // =========================================================
        // 4. FINAL VERIFICATION (Complete KYC Flow)
        // =========================================================
        [HttpPost("CompleteKYC")]
        public IActionResult CompleteKYC([FromBody] CompleteKYCRequest request)
        {
            return ApiHandler.Handle(() =>
            {
                if (request == null || request.UserID <= 0)
                    return BadRequest(new { message = "Invalid request." });

                // Call Cashfree final verification
                var url = $"{_baseUrl}/verification/digilocker/verify-account";
                var payload = new
                {
                    verification_id = request.VerificationID,
                    mobile_number = request.MobileNumber,
                    aadhaar_number = request.AadhaarNumber
                };

                var jsonContent = JsonConvert.SerializeObject(payload);
                var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);

                httpRequest.Headers.Add("x-client-id", _clientId);
                httpRequest.Headers.Add("x-client-secret", _clientSecret);
                
                httpRequest.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = _httpClient.SendAsync(httpRequest).GetAwaiter().GetResult();
                var responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                dynamic result = JsonConvert.DeserializeObject(responseContent);
                bool isVerified = response.IsSuccessStatusCode && result?.verification_status?.ToString() == "SUCCESS";

                // Update KYC status
                var existingRecord = GetKYCRecordByUserIDSync(request.UserID, request.TenantID);
                var kycRecord = existingRecord ?? new MangalBhavPopularity();

                kycRecord.UserID = request.UserID;
                kycRecord.TenantID = request.TenantID;
                kycRecord.IsEKYC = isVerified;
                kycRecord.IsMBVerified = isVerified;
                kycRecord.Remarks = isVerified ? "KYC completed successfully" : $"KYC failed: {result?.message}";
                kycRecord.DateModified = DateTime.Now;
                kycRecord.UpdatedByUser = request.UpdatedByUser ?? "System";

                if (existingRecord == null)
                    kycRecord.DateAdded = DateTime.Now;

                if (existingRecord != null)
                    UpdateKYCRecordSync(kycRecord);
                else
                    SaveKYCRecordSync(kycRecord);

                return StatusCode((int)response.StatusCode, new
                {
                    Status = isVerified ? "Success" : "Failed",
                    IsVerified = isVerified,
                    Message = isVerified ? "KYC verification completed" : "KYC verification failed",
                    CashfreeResponse = result
                });
            }, this);
        }

        // =========================================================
        // 5. GET KYC STATUS BY USER
        // =========================================================
        [HttpPost("GetKYCStatus")]
        [EnableCors("AllowAll")]
        public IActionResult GetKYCStatus(int userId, int tenantId = 1)
        {
            return ApiHandler.Handle(() =>
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@TenantID", tenantId),
                    new SqlParameter("@SchoolID", 0),
                    new SqlParameter("@Query", $"UserID = {userId}")
                };

                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "MangalBhavPopularitySelectByQuery",
                    parameters))
                {
                    List<MangalBhavPopularity> list = new List<MangalBhavPopularity>();
                    while (dataReader.Read())
                    {
                        list.Add(MakeMangalBhavPopularity(dataReader));
                    }

                    if (list.Count == 0)
                    {
                        return Ok(new
                        {
                            Status = "NotFound",
                            IsVerified = false,
                            Message = "No KYC record found for this user."
                        });
                    }

                    var record = list[0];
                    return Ok(new
                    {
                        Status = "Success",
                        IsVerified = record.IsEKYC && record.IsMBVerified,
                        IsEKYC = record.IsEKYC,
                        IsMBVerified = record.IsMBVerified,
                        IsPremium = record.IsPremium,
                        IsRecommended = record.IsRecommended,
                        VerifiedName = record.VerifiedName,
                        VerifiedAddress = record.VerifiedAddress,
                        VerifiedDOB = record.VerifiedDOB,
                        VerifiedGender = record.VerifiedGender,
                        Remarks = record.Remarks,
                        DateAdded = record.DateAdded,
                        DateModified = record.DateModified
                    });
                }
            }, this);
        }

        // =========================================================
        // 6. UPDATE KYC MANUALLY (Admin/Override)
        // =========================================================
        [HttpPost("UpdateKYCStatus")]
        [EnableCors("AllowAll")]
        public IActionResult UpdateKYCStatus([FromBody] UpdateKYCStatusRequest request)
        {
            return ApiHandler.Handle(() =>
            {
                if (request == null || request.UserID <= 0)
                    return BadRequest(new { message = "Invalid request." });

                var existingRecord = GetKYCRecordByUserIDSync(request.UserID, request.TenantID);

                var kycRecord = existingRecord ?? new MangalBhavPopularity();
                kycRecord.UserID = request.UserID;
                kycRecord.TenantID = request.TenantID;
                kycRecord.IsEKYC = request.IsEKYC;
                kycRecord.IsMBVerified = request.IsMBVerified;
                kycRecord.IsPremium = request.IsPremium ?? kycRecord.IsPremium;
                kycRecord.IsRecommended = request.IsRecommended ?? kycRecord.IsRecommended;
                kycRecord.VerifiedName = request.VerifiedName ?? kycRecord.VerifiedName;
                kycRecord.VerifiedAddress = request.VerifiedAddress ?? kycRecord.VerifiedAddress;
                kycRecord.VerifiedDOB = request.VerifiedDOB ?? kycRecord.VerifiedDOB;
                kycRecord.VerifiedGender = request.VerifiedGender ?? kycRecord.VerifiedGender;
                kycRecord.Remarks = request.Remarks ?? kycRecord.Remarks;
                kycRecord.DateModified = DateTime.Now;
                kycRecord.UpdatedByUser = request.UpdatedByUser ?? "Admin";

                if (existingRecord == null)
                {
                    kycRecord.DateAdded = DateTime.Now;
                    SaveKYCRecordSync(kycRecord);
                }
                else
                {
                    UpdateKYCRecordSync(kycRecord);
                }

                return Ok(new
                {
                    Status = "Success",
                    Message = "KYC status updated successfully",
                    UserID = request.UserID,
                    IsEKYC = kycRecord.IsEKYC,
                    IsMBVerified = kycRecord.IsMBVerified
                });
            }, this);
        }

        // =========================================================
        // HELPER METHODS (ALL SYNC - matching your ApiHandler pattern)
        // =========================================================

        private MangalBhavPopularity GetKYCRecordByUserIDSync(int userId, int tenantId)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@TenantID", tenantId),
                new SqlParameter("@SchoolID", 0),
                new SqlParameter("@Query", $"UserID = {userId}")
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                CommandType.StoredProcedure,
                "MangalBhavPopularitySelectByQuery",
                parameters))
            {
                if (dataReader.Read())
                    return MakeMangalBhavPopularity(dataReader);
            }
            return null;
        }

        private void SaveKYCRecordSync(MangalBhavPopularity record)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@TenantID", record.TenantID == 0 ? SqlInt32.Null : record.TenantID),
                new SqlParameter("@UserID", record.UserID == 0 ? SqlInt32.Null : record.UserID),
                new SqlParameter("@IsEKYC", record.IsEKYC),
                new SqlParameter("@IsPremium", record.IsPremium),
                new SqlParameter("@IsRecommended", record.IsRecommended),
                new SqlParameter("@IsMBVerified", record.IsMBVerified),
                new SqlParameter("@VerifiedName", (object)record.VerifiedName ?? DBNull.Value),
                new SqlParameter("@VerifiedAddress", (object)record.VerifiedAddress ?? DBNull.Value),
                new SqlParameter("@VerifiedDOB", (object)record.VerifiedDOB ?? DBNull.Value),
                new SqlParameter("@VerifiedGender", (object)record.VerifiedGender ?? DBNull.Value),
                new SqlParameter("@Remarks", (object)record.Remarks ?? DBNull.Value),
                new SqlParameter("@Descriptions", (object)record.Descriptions ?? DBNull.Value),
                new SqlParameter("@DateAdded", record.DateAdded == DateTime.MinValue ? SqlDateTime.Null : record.DateAdded),
                new SqlParameter("@DateModified", record.DateModified == DateTime.MinValue ? SqlDateTime.Null : record.DateModified),
                new SqlParameter("@UpdatedByUser", (object)record.UpdatedByUser ?? DBNull.Value)
            };

            var newId = DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MangalBhavPopularityInsert", parameters);
            record.MangalBhavPopularityID = Convert.ToInt32(newId);

        }

        private void UpdateKYCRecordSync(MangalBhavPopularity record)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@MangalBhavPopularityID", record.MangalBhavPopularityID == 0 ? SqlInt32.Null : record.MangalBhavPopularityID),
                new SqlParameter("@TenantID", record.TenantID == 0 ? SqlInt32.Null : record.TenantID),
                new SqlParameter("@UserID", record.UserID == 0 ? SqlInt32.Null : record.UserID),
                new SqlParameter("@IsEKYC", record.IsEKYC),
                new SqlParameter("@IsPremium", record.IsPremium),
                new SqlParameter("@IsRecommended", record.IsRecommended),
                new SqlParameter("@IsMBVerified", record.IsMBVerified),
                new SqlParameter("@VerifiedName", (object)record.VerifiedName ?? DBNull.Value),
                new SqlParameter("@VerifiedAddress", (object)record.VerifiedAddress ?? DBNull.Value),
                new SqlParameter("@VerifiedDOB", (object)record.VerifiedDOB ?? DBNull.Value),
                new SqlParameter("@VerifiedGender", (object)record.VerifiedGender ?? DBNull.Value),
                new SqlParameter("@Remarks", (object)record.Remarks ?? DBNull.Value),
                new SqlParameter("@Descriptions", (object)record.Descriptions ?? DBNull.Value),
                new SqlParameter("@DateAdded", record.DateAdded == DateTime.MinValue ? SqlDateTime.Null : record.DateAdded),
                new SqlParameter("@DateModified", record.DateModified == DateTime.MinValue ? SqlDateTime.Null : record.DateModified),
                new SqlParameter("@UpdatedByUser", (object)record.UpdatedByUser ?? DBNull.Value)
            };

            DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MangalBhavPopularityUpdate", parameters);
        }

        private void UpdateUserProfileWithKYCSync(int userId, string name, string address, string dob, string gender, string photoPath)
        {
            // Update Profiles table with verified KYC data
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@Query", $"UserID = {userId}")
            };

            using (SqlDataReader dr = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfilesNUSelectByQuery", parameters))
            {
                if (dr.Read())
                {
                    // Profile exists — you can update with verified data if needed
                    // Using existing stored procedure pattern
                }
            }
        }




        private async Task<string> SaveAadhaarPhotoAsync(string base64Image, string verificationId)
        {
            try
            {
                if (string.IsNullOrEmpty(base64Image)) return "";

                // Remove base64 header if present — same as working project
                var base64Data = base64Image.Contains(",")
                    ? base64Image.Split(',')[1]
                    : base64Image;

                // Convert to bytes
                byte[] imageBytes = Convert.FromBase64String(base64Data);

                // Use same relative path pattern as VedantaSchoolNU
                string folderPath = "ClientApp\\src\\assets\\kyc-photos";

                // Ensure folder exists
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                // Generate file name
                string fileName = $"kyc_{verificationId}_{DateTime.Now.Ticks}.png";
                string filePath = Path.Combine(folderPath, fileName);

                // Async write — same as working project
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                Console.WriteLine($"[KYC] Photo saved: {filePath}");

                return fileName;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KYC] SaveAadhaarPhoto ERROR: {ex.Message}");
                return "";
            }
        }


        private string GetLast4(string input)
        {
            if (string.IsNullOrEmpty(input)) return "";
            var cleaned = input.Replace(" ", "").Trim();
            return cleaned.Length >= 4 ? cleaned.Substring(cleaned.Length - 4) : cleaned;
        }

        private MangalBhavPopularity MakeMangalBhavPopularity(SqlDataReader dataReader)
        {
            return new MangalBhavPopularity
            {
                MangalBhavPopularityID = DataAccess.GetInt32(dataReader, "MangalBhavPopularityID", 0),
                TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0),
                UserID = DataAccess.GetInt32(dataReader, "UserID", 0),
                IsEKYC = DataAccess.GetBoolean(dataReader, "IsEKYC", false),
                IsPremium = DataAccess.GetBoolean(dataReader, "IsPremium", false),
                IsRecommended = DataAccess.GetBoolean(dataReader, "IsRecommended", false),
                IsMBVerified = DataAccess.GetBoolean(dataReader, "IsMBVerified", false),
                VerifiedName = DataAccess.GetString(dataReader, "VerifiedName", string.Empty),
                VerifiedAddress = DataAccess.GetString(dataReader, "VerifiedAddress", string.Empty),
                VerifiedDOB = DataAccess.GetString(dataReader, "VerifiedDOB", string.Empty),
                VerifiedGender = DataAccess.GetString(dataReader, "VerifiedGender", string.Empty),
                Remarks = DataAccess.GetString(dataReader, "Remarks", string.Empty),
                Descriptions = DataAccess.GetString(dataReader, "Descriptions", string.Empty),
                DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue),
                DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue),
                UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", string.Empty)
            };
        }
    }

    // =========================================================
    // REQUEST MODELS
    // =========================================================
    public class KYCAuthRequest
    {
        public int UserID { get; set; }
        public int TenantID { get; set; } = 1;
        public string VerificationID { get; set; }
        public string[] DocumentRequested { get; set; }
        public string RedirectUrl { get; set; }
        public string UserFlow { get; set; }
        public string UpdatedByUser { get; set; }
    }

    public class CompleteKYCRequest
    {
        public int UserID { get; set; }
        public int TenantID { get; set; } = 1;
        public string VerificationID { get; set; }
        public string MobileNumber { get; set; }
        public string AadhaarNumber { get; set; }
        public string UpdatedByUser { get; set; }
    }

    public class UpdateKYCStatusRequest
    {
        public int UserID { get; set; }
        public int TenantID { get; set; } = 1;
        public bool IsEKYC { get; set; }
        public bool IsMBVerified { get; set; }
        public bool? IsPremium { get; set; }
        public bool? IsRecommended { get; set; }
        public string VerifiedName { get; set; }
        public string VerifiedAddress { get; set; }
        public string VerifiedDOB { get; set; }
        public string VerifiedGender { get; set; }
        public string Remarks { get; set; }
        public string UpdatedByUser { get; set; }
    }
}