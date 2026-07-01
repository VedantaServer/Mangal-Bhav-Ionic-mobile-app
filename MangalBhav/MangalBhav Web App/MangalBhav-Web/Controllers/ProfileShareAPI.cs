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
	public class ProfileShareAPI : ControllerBase
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
		/// Saves a record to the ProfileShare table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareInsert")]
		public  IActionResult ProfileShareInsert([FromBody] ProfileShare profileShare)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", profileShare.TenantID == 0 ? SqlInt32.Null : profileShare.TenantID ),
				new SqlParameter("@PanditUserID", profileShare.PanditUserID == 0 ? SqlInt32.Null : profileShare.PanditUserID ),
				new SqlParameter("@SharedByUserID", profileShare.SharedByUserID == 0 ? SqlInt32.Null : profileShare.SharedByUserID ),
				new SqlParameter("@IPAddress", profileShare.IPAddress),
				new SqlParameter("@Device", profileShare.Device),
				new SqlParameter("@Source", profileShare.Source),
				new SqlParameter("@DateAdded", profileShare.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileShare.DateAdded )
			};

			profileShare.ProfileShareID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileShareInsert", parameters));
			return Ok(new {ProfileShareID=profileShare.ProfileShareID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ProfileShare table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareUpdate")]
		public  IActionResult ProfileShareUpdate([FromBody] ProfileShare profileShare)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileShareID", profileShare.ProfileShareID == 0 ? SqlInt32.Null : profileShare.ProfileShareID ),
				new SqlParameter("@TenantID", profileShare.TenantID == 0 ? SqlInt32.Null : profileShare.TenantID ),
				new SqlParameter("@PanditUserID", profileShare.PanditUserID == 0 ? SqlInt32.Null : profileShare.PanditUserID ),
				new SqlParameter("@SharedByUserID", profileShare.SharedByUserID == 0 ? SqlInt32.Null : profileShare.SharedByUserID ),
				new SqlParameter("@IPAddress", profileShare.IPAddress),
				new SqlParameter("@Device", profileShare.Device),
				new SqlParameter("@Source", profileShare.Source),
				new SqlParameter("@DateAdded", profileShare.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileShare.DateAdded )
			};

			 var ProfileShareID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProfileShareUpdate", parameters));
			return Ok(new {ProfileShareID =ProfileShareID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ProfileShare table by its primary key.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareDelete")]
		public  IActionResult ProfileShareDelete(int profileShareID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileShareID", profileShareID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var profileShareDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileShareDelete", parameters));
			return Ok(new {ProfileShareID =profileShareDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileShare table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareSelect")]
		public IActionResult ProfileShareSelect(int profileShareID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileShareID", profileShareID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileShareSelect", parameters))
			{
				List<ProfileShare> ProfileShareList = new List<ProfileShare>();
				while (dataReader.Read())
				{
					ProfileShare ProfileShare = MakeProfileShare(dataReader);
					ProfileShareList.Add(ProfileShare);
				}

				return  Ok(new {ProfileShareList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileShare table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareSelectAll")]
		public IActionResult ProfileShareSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileShareSelectAll", parameters))
			{
				List<ProfileShare> ProfileShareList = new List<ProfileShare>();
				while (dataReader.Read())
				{
					ProfileShare ProfileShare = MakeProfileShare(dataReader);
					ProfileShareList.Add(ProfileShare);
				}

				return  Ok(new {ProfileShareList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ProfileShare table by a ak=ll query.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileShareSelectByQuery")]
		public  IActionResult ProfileShareSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfileShareSelectByQuery", parameters))
			{
				List<ProfileShare> ProfileShareList = new List<ProfileShare>();
				while (dataReader.Read())
				{
					ProfileShare ProfileShare = MakeProfileShare(dataReader);
					ProfileShareList.Add(ProfileShare);
				}

				return  Ok(new {ProfileShareList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ProfileShare class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ProfileShare MakeProfileShare(SqlDataReader dataReader)
		{
			ProfileShare profileShare = new ProfileShare();
			profileShare.ProfileShareID = DataAccess.GetInt32(dataReader, "ProfileShareID", 0);
			profileShare.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			profileShare.PanditUserID = DataAccess.GetInt32(dataReader, "PanditUserID", 0);
			profileShare.SharedByUserID = DataAccess.GetInt32(dataReader, "SharedByUserID", 0);
			profileShare.IPAddress = DataAccess.GetString(dataReader, "IPAddress", String.Empty);
			profileShare.Device = DataAccess.GetString(dataReader, "Device", String.Empty);
			profileShare.Source = DataAccess.GetString(dataReader, "Source", String.Empty);
			profileShare.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return profileShare;
		}

	}
	}
