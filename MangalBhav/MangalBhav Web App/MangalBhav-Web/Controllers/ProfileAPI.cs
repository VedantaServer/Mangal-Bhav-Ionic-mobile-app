using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Cors;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;

namespace FaceUPAI.API
{
	public class ProfileAPI : ControllerBase
	{
	public IActionResult Index()
	{
	return View();
	}
	private IActionResult View()
	{
	throw new NotImplementedException();
	}
		/// <summary>
		/// Saves a record to the Profiles table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesInsert")]
		public  IActionResult ProfilesInsert([FromBody] Profile profile)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", profile.TenantID == 0 ? SqlInt32.Null : profile.TenantID ),
				new SqlParameter("@UserID", profile.UserID == 0 ? SqlInt32.Null : profile.UserID ),
				new SqlParameter("@FullName", profile.FullName),
				new SqlParameter("@DOB", profile.DOB == DateTime.MinValue ? SqlDateTime.Null : profile.DOB ),
				new SqlParameter("@Gender", profile.Gender),
				new SqlParameter("@PhoneNumber", profile.PhoneNumber),
				new SqlParameter("@Email", profile.Email),
				new SqlParameter("@ExperienceYears", profile.ExperienceYears == 0 ? SqlInt32.Null : profile.ExperienceYears ),
				new SqlParameter("@Bio", profile.Bio),
				new SqlParameter("@Languages", profile.Languages),
				new SqlParameter("@BasePrice", profile.BasePrice),
				new SqlParameter("@ProfilePhotoUrl", profile.ProfilePhotoUrl),
				new SqlParameter("@VerificationStatus", profile.VerificationStatus),
				new SqlParameter("@IsActive", profile.IsActive),
				new SqlParameter("@DateAdded", profile.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profile.DateAdded ),
				new SqlParameter("@DateModified", profile.DateModified == DateTime.MinValue ? SqlDateTime.Null : profile.DateModified ),
				new SqlParameter("@UpdatedByUser", profile.UpdatedByUser)
			};

			profile.ProfileID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfilesInsert", parameters));
			return Ok(new {ProfileID=profile.ProfileID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Profiles table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesUpdate")]
		public  IActionResult ProfilesUpdate([FromBody] Profile profile)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileID", profile.ProfileID == 0 ? SqlInt32.Null : profile.ProfileID ),
				new SqlParameter("@TenantID", profile.TenantID == 0 ? SqlInt32.Null : profile.TenantID ),
				new SqlParameter("@UserID", profile.UserID == 0 ? SqlInt32.Null : profile.UserID ),
				new SqlParameter("@FullName", profile.FullName),
				new SqlParameter("@DOB", profile.DOB == DateTime.MinValue ? SqlDateTime.Null : profile.DOB ),
				new SqlParameter("@Gender", profile.Gender),
				new SqlParameter("@PhoneNumber", profile.PhoneNumber),
				new SqlParameter("@Email", profile.Email),
				new SqlParameter("@ExperienceYears", profile.ExperienceYears == 0 ? SqlInt32.Null : profile.ExperienceYears ),
				new SqlParameter("@Bio", profile.Bio),
				new SqlParameter("@Languages", profile.Languages),
				new SqlParameter("@BasePrice", profile.BasePrice),
				new SqlParameter("@ProfilePhotoUrl", profile.ProfilePhotoUrl),
				new SqlParameter("@VerificationStatus", profile.VerificationStatus),
				new SqlParameter("@IsActive", profile.IsActive),
				new SqlParameter("@DateAdded", profile.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profile.DateAdded ),
				new SqlParameter("@DateModified", profile.DateModified == DateTime.MinValue ? SqlDateTime.Null : profile.DateModified ),
				new SqlParameter("@UpdatedByUser", profile.UpdatedByUser)
			};

			 var ProfileID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProfilesUpdate", parameters));
			return Ok(new {ProfileID =ProfileID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Profiles table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesDelete")]
		public  IActionResult ProfilesDelete(int profileID, int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileID", profileID)
				,new SqlParameter("@TenantID", tenantID)
			};

			 var profilesDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfilesDelete", parameters));
			return Ok(new {ProfilesID =profilesDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Profiles table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfileSelect")]
		public IActionResult ProfileSelect(int profileID,int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileID", profileID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfilesSelect", parameters))
			{
				List<Profile> ProfileList = new List<Profile>();
				while (dataReader.Read())
				{
					Profile Profile = MakeProfile(dataReader);
					ProfileList.Add(Profile);
				}

				return  Ok(new {ProfileList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Profiles table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfileSelectAll")]
		public IActionResult ProfileSelectAll(int tenantID ){
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfilesSelectAll", parameters))
			{
				List<Profile> ProfileList = new List<Profile>();
				while (dataReader.Read())
				{
					Profile Profile = MakeProfile(dataReader);
					ProfileList.Add(Profile);
				}

				return  Ok(new {ProfileList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Profiles table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesSelectAllByTenantID")]
		public  IActionResult ProfilesSelectAllByTenantID(int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfilesSelectAllByTenantID", parameters))
			{
				List<Profile> ProfileList = new List<Profile>();
				while (dataReader.Read())
				{
					Profile Profile = MakeProfile(dataReader);
					ProfileList.Add(Profile);
				}

				return  Ok(new {ProfileList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Profiles table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesSelectAllByUserID")]
		public  IActionResult ProfilesSelectAllByUserID(int userID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", userID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfilesSelectAllByUserID", parameters))
			{
				List<Profile> ProfileList = new List<Profile>();
				while (dataReader.Read())
				{
					Profile Profile = MakeProfile(dataReader);
					ProfileList.Add(Profile);
				}

				return  Ok(new {ProfileList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Profiles table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ProfilesNUSelectByQuery")]
		public  IActionResult ProfilesNUSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
							new SqlParameter("@Query", Query)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfilesNUSelectByQuery", parameters))
			{
				List<Profile> ProfileList = new List<Profile>();
				while (dataReader.Read())
				{
					Profile Profile = MakeProfile(dataReader);
					ProfileList.Add(Profile);
				}

				return  Ok(new {ProfileList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Profiles class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Profile MakeProfile(SqlDataReader dataReader)
		{
			Profile profile = new Profile();
			profile.ProfileID = DataAccess.GetInt32(dataReader, "ProfileID", 0);
			profile.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			profile.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			profile.FullName = DataAccess.GetString(dataReader, "FullName", String.Empty);
			profile.DOB = DataAccess.GetDateTime(dataReader, "DOB", DateTime.MinValue);
			profile.Gender = DataAccess.GetString(dataReader, "Gender", String.Empty);
			profile.PhoneNumber = DataAccess.GetString(dataReader, "PhoneNumber", String.Empty);
			profile.Email = DataAccess.GetString(dataReader, "Email", String.Empty);
			profile.ExperienceYears = DataAccess.GetInt32(dataReader, "ExperienceYears", 0);
			profile.Bio = DataAccess.GetString(dataReader, "Bio", String.Empty);
			profile.Languages = DataAccess.GetString(dataReader, "Languages", String.Empty);
			profile.BasePrice = DataAccess.GetDecimal(dataReader, "BasePrice", Decimal.Zero);
			profile.ProfilePhotoUrl = DataAccess.GetString(dataReader, "ProfilePhotoUrl", String.Empty);
			profile.VerificationStatus = DataAccess.GetString(dataReader, "VerificationStatus", String.Empty);
			profile.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			profile.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			profile.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			profile.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return profile;
		}

	}
	}
