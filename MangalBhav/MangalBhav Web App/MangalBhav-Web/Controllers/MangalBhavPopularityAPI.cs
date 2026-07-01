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
	public class MangalBhavPopularityAPI : ControllerBase
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
		/// Saves a record to the MangalBhavPopularity table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularityInsert")]
		public  IActionResult MangalBhavPopularityInsert([FromBody] MangalBhavPopularity mangalBhavPopularity)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", mangalBhavPopularity.TenantID == 0 ? SqlInt32.Null : mangalBhavPopularity.TenantID ),
				new SqlParameter("@UserID", mangalBhavPopularity.UserID == 0 ? SqlInt32.Null : mangalBhavPopularity.UserID ),
				new SqlParameter("@IsEKYC", mangalBhavPopularity.IsEKYC),
				new SqlParameter("@IsPremium", mangalBhavPopularity.IsPremium),
				new SqlParameter("@IsRecommended", mangalBhavPopularity.IsRecommended),
				new SqlParameter("@IsMBVerified", mangalBhavPopularity.IsMBVerified),
				new SqlParameter("@VerifiedName", mangalBhavPopularity.VerifiedName),
				new SqlParameter("@VerifiedAddress", mangalBhavPopularity.VerifiedAddress),
				new SqlParameter("@VerifiedDOB", mangalBhavPopularity.VerifiedDOB),
				new SqlParameter("@VerifiedGender", mangalBhavPopularity.VerifiedGender),
				new SqlParameter("@Remarks", mangalBhavPopularity.Remarks),
				new SqlParameter("@Descriptions", mangalBhavPopularity.Descriptions),
				new SqlParameter("@DateAdded", mangalBhavPopularity.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mangalBhavPopularity.DateAdded ),
				new SqlParameter("@DateModified", mangalBhavPopularity.DateModified == DateTime.MinValue ? SqlDateTime.Null : mangalBhavPopularity.DateModified ),
				new SqlParameter("@UpdatedByUser", mangalBhavPopularity.UpdatedByUser)
			};

			mangalBhavPopularity.MangalBhavPopularityID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MangalBhavPopularityInsert", parameters));
			return Ok(new {MangalBhavPopularityID=mangalBhavPopularity.MangalBhavPopularityID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the MangalBhavPopularity table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularityUpdate")]
		public  IActionResult MangalBhavPopularityUpdate([FromBody] MangalBhavPopularity mangalBhavPopularity)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MangalBhavPopularityID", mangalBhavPopularity.MangalBhavPopularityID == 0 ? SqlInt32.Null : mangalBhavPopularity.MangalBhavPopularityID ),
				new SqlParameter("@TenantID", mangalBhavPopularity.TenantID == 0 ? SqlInt32.Null : mangalBhavPopularity.TenantID ),
				new SqlParameter("@UserID", mangalBhavPopularity.UserID == 0 ? SqlInt32.Null : mangalBhavPopularity.UserID ),
				new SqlParameter("@IsEKYC", mangalBhavPopularity.IsEKYC),
				new SqlParameter("@IsPremium", mangalBhavPopularity.IsPremium),
				new SqlParameter("@IsRecommended", mangalBhavPopularity.IsRecommended),
				new SqlParameter("@IsMBVerified", mangalBhavPopularity.IsMBVerified),
				new SqlParameter("@VerifiedName", mangalBhavPopularity.VerifiedName),
				new SqlParameter("@VerifiedAddress", mangalBhavPopularity.VerifiedAddress),
				new SqlParameter("@VerifiedDOB", mangalBhavPopularity.VerifiedDOB),
				new SqlParameter("@VerifiedGender", mangalBhavPopularity.VerifiedGender),
				new SqlParameter("@Remarks", mangalBhavPopularity.Remarks),
				new SqlParameter("@Descriptions", mangalBhavPopularity.Descriptions),
				new SqlParameter("@DateAdded", mangalBhavPopularity.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mangalBhavPopularity.DateAdded ),
				new SqlParameter("@DateModified", mangalBhavPopularity.DateModified == DateTime.MinValue ? SqlDateTime.Null : mangalBhavPopularity.DateModified ),
				new SqlParameter("@UpdatedByUser", mangalBhavPopularity.UpdatedByUser)
			};

			 var MangalBhavPopularityID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MangalBhavPopularityUpdate", parameters));
			return Ok(new {MangalBhavPopularityID =MangalBhavPopularityID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the MangalBhavPopularity table by its primary key.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularityDelete")]
		public  IActionResult MangalBhavPopularityDelete(int mangalBhavPopularityID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MangalBhavPopularityID", mangalBhavPopularityID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var mangalBhavPopularityDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MangalBhavPopularityDelete", parameters));
			return Ok(new {MangalBhavPopularityID =mangalBhavPopularityDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MangalBhavPopularity table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularitySelect")]
		public IActionResult MangalBhavPopularitySelect(int mangalBhavPopularityID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MangalBhavPopularityID", mangalBhavPopularityID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MangalBhavPopularitySelect", parameters))
			{
				List<MangalBhavPopularity> MangalBhavPopularityList = new List<MangalBhavPopularity>();
				while (dataReader.Read())
				{
					MangalBhavPopularity MangalBhavPopularity = MakeMangalBhavPopularity(dataReader);
					MangalBhavPopularityList.Add(MangalBhavPopularity);
				}

				return  Ok(new {MangalBhavPopularityList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MangalBhavPopularity table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularitySelectAll")]
		public IActionResult MangalBhavPopularitySelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MangalBhavPopularitySelectAll", parameters))
			{
				List<MangalBhavPopularity> MangalBhavPopularityList = new List<MangalBhavPopularity>();
				while (dataReader.Read())
				{
					MangalBhavPopularity MangalBhavPopularity = MakeMangalBhavPopularity(dataReader);
					MangalBhavPopularityList.Add(MangalBhavPopularity);
				}

				return  Ok(new {MangalBhavPopularityList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MangalBhavPopularity table by a ak=ll query.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("MangalBhavPopularitySelectByQuery")]
		public  IActionResult MangalBhavPopularitySelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MangalBhavPopularitySelectByQuery", parameters))
			{
				List<MangalBhavPopularity> MangalBhavPopularityList = new List<MangalBhavPopularity>();
				while (dataReader.Read())
				{
					MangalBhavPopularity MangalBhavPopularity = MakeMangalBhavPopularity(dataReader);
					MangalBhavPopularityList.Add(MangalBhavPopularity);
				}

				return  Ok(new {MangalBhavPopularityList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MangalBhavPopularity class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MangalBhavPopularity MakeMangalBhavPopularity(SqlDataReader dataReader)
		{
			MangalBhavPopularity mangalBhavPopularity = new MangalBhavPopularity();
			mangalBhavPopularity.MangalBhavPopularityID = DataAccess.GetInt32(dataReader, "MangalBhavPopularityID", 0);
			mangalBhavPopularity.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mangalBhavPopularity.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			mangalBhavPopularity.IsEKYC = DataAccess.GetBoolean(dataReader, "IsEKYC", false);
			mangalBhavPopularity.IsPremium = DataAccess.GetBoolean(dataReader, "IsPremium", false);
			mangalBhavPopularity.IsRecommended = DataAccess.GetBoolean(dataReader, "IsRecommended", false);
			mangalBhavPopularity.IsMBVerified = DataAccess.GetBoolean(dataReader, "IsMBVerified", false);
			mangalBhavPopularity.VerifiedName = DataAccess.GetString(dataReader, "VerifiedName", String.Empty);
			mangalBhavPopularity.VerifiedAddress = DataAccess.GetString(dataReader, "VerifiedAddress", String.Empty);
			mangalBhavPopularity.VerifiedDOB = DataAccess.GetString(dataReader, "VerifiedDOB", String.Empty);
			mangalBhavPopularity.VerifiedGender = DataAccess.GetString(dataReader, "VerifiedGender", String.Empty);
			mangalBhavPopularity.Remarks = DataAccess.GetString(dataReader, "Remarks", String.Empty);
			mangalBhavPopularity.Descriptions = DataAccess.GetString(dataReader, "Descriptions", String.Empty);
			mangalBhavPopularity.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mangalBhavPopularity.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mangalBhavPopularity.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return mangalBhavPopularity;
		}

	}
	}
