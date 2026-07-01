using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class ProfileLikeAPI : ControllerBase
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
		/// Saves a record to the ProfileLike table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeInsert")]
		public  IActionResult ProfileLikeInsert([FromBody] ProfileLike profileLike)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", profileLike.TenantID == 0 ? SqlInt32.Null : profileLike.TenantID ),
				new SqlParameter("@PanditUserID", profileLike.PanditUserID == 0 ? SqlInt32.Null : profileLike.PanditUserID ),
				new SqlParameter("@LikedByUserID", profileLike.LikedByUserID == 0 ? SqlInt32.Null : profileLike.LikedByUserID ),
				new SqlParameter("@IPAddress", profileLike.IPAddress),
				new SqlParameter("@Device", profileLike.Device),
				new SqlParameter("@Source", profileLike.Source),
				new SqlParameter("@DateAdded", profileLike.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileLike.DateAdded )
			};

			profileLike.ProfileLikeID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileLikeInsert", parameters));
			return Ok(new {ProfileLikeID=profileLike.ProfileLikeID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ProfileLike table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeUpdate")]
		public  IActionResult ProfileLikeUpdate([FromBody] ProfileLike profileLike)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileLikeID", profileLike.ProfileLikeID == 0 ? SqlInt32.Null : profileLike.ProfileLikeID ),
				new SqlParameter("@TenantID", profileLike.TenantID == 0 ? SqlInt32.Null : profileLike.TenantID ),
				new SqlParameter("@PanditUserID", profileLike.PanditUserID == 0 ? SqlInt32.Null : profileLike.PanditUserID ),
				new SqlParameter("@LikedByUserID", profileLike.LikedByUserID == 0 ? SqlInt32.Null : profileLike.LikedByUserID ),
				new SqlParameter("@IPAddress", profileLike.IPAddress),
				new SqlParameter("@Device", profileLike.Device),
				new SqlParameter("@Source", profileLike.Source),
				new SqlParameter("@DateAdded", profileLike.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileLike.DateAdded )
			};

			 var ProfileLikeID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProfileLikeUpdate", parameters));
			return Ok(new {ProfileLikeID =ProfileLikeID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ProfileLike table by its primary key.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeDelete")]
		public  IActionResult ProfileLikeDelete(int profileLikeID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileLikeID", profileLikeID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var profileLikeDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileLikeDelete", parameters));
			return Ok(new {ProfileLikeID =profileLikeDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileLike table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeSelect")]
		public IActionResult ProfileLikeSelect(int profileLikeID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileLikeID", profileLikeID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileLikeSelect", parameters))
			{
				List<ProfileLike> ProfileLikeList = new List<ProfileLike>();
				while (dataReader.Read())
				{
					ProfileLike ProfileLike = MakeProfileLike(dataReader);
					ProfileLikeList.Add(ProfileLike);
				}

				return  Ok(new {ProfileLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileLike table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeSelectAll")]
		public IActionResult ProfileLikeSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileLikeSelectAll", parameters))
			{
				List<ProfileLike> ProfileLikeList = new List<ProfileLike>();
				while (dataReader.Read())
				{
					ProfileLike ProfileLike = MakeProfileLike(dataReader);
					ProfileLikeList.Add(ProfileLike);
				}

				return  Ok(new {ProfileLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ProfileLike table by a ak=ll query.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileLikeSelectByQuery")]
		public  IActionResult ProfileLikeSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfileLikeSelectByQuery", parameters))
			{
				List<ProfileLike> ProfileLikeList = new List<ProfileLike>();
				while (dataReader.Read())
				{
					ProfileLike ProfileLike = MakeProfileLike(dataReader);
					ProfileLikeList.Add(ProfileLike);
				}

				return  Ok(new {ProfileLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ProfileLike class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ProfileLike MakeProfileLike(SqlDataReader dataReader)
		{
			ProfileLike profileLike = new ProfileLike();
			profileLike.ProfileLikeID = DataAccess.GetInt32(dataReader, "ProfileLikeID", 0);
			profileLike.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			profileLike.PanditUserID = DataAccess.GetInt32(dataReader, "PanditUserID", 0);
			profileLike.LikedByUserID = DataAccess.GetInt32(dataReader, "LikedByUserID", 0);
			profileLike.IPAddress = DataAccess.GetString(dataReader, "IPAddress", String.Empty);
			profileLike.Device = DataAccess.GetString(dataReader, "Device", String.Empty);
			profileLike.Source = DataAccess.GetString(dataReader, "Source", String.Empty);
			profileLike.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return profileLike;
		}

	}
	}
