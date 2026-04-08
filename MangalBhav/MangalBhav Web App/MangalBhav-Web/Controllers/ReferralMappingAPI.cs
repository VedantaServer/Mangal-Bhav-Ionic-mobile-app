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
	public class ReferralMappingAPI : ControllerBase
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
		/// Saves a record to the ReferralMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ReferralMappingInsert")]
		public  IActionResult ReferralMappingInsert([FromBody] ReferralMapping referralMapping)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", referralMapping.TenantID == 0 ? SqlInt32.Null : referralMapping.TenantID ),
				new SqlParameter("@UserReferralCodeID", referralMapping.UserReferralCodeID == 0 ? SqlInt32.Null : referralMapping.UserReferralCodeID ),
				new SqlParameter("@ReferredUserID", referralMapping.ReferredUserID == 0 ? SqlInt32.Null : referralMapping.ReferredUserID ),
				new SqlParameter("@DateAdded", referralMapping.DateAdded == DateTime.MinValue ? SqlDateTime.Null : referralMapping.DateAdded )
			};

			referralMapping.ReferralMappingID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ReferralMappingInsert", parameters));
			return Ok(new {ReferralMappingID=referralMapping.ReferralMappingID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ReferralMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ReferralMappingUpdate")]
		public  IActionResult ReferralMappingUpdate([FromBody] ReferralMapping referralMapping)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", referralMapping.TenantID == 0 ? SqlInt32.Null : referralMapping.TenantID ),
				new SqlParameter("@ReferralMappingID", referralMapping.ReferralMappingID == 0 ? SqlInt32.Null : referralMapping.ReferralMappingID ),
				new SqlParameter("@UserReferralCodeID", referralMapping.UserReferralCodeID == 0 ? SqlInt32.Null : referralMapping.UserReferralCodeID ),
				new SqlParameter("@ReferredUserID", referralMapping.ReferredUserID == 0 ? SqlInt32.Null : referralMapping.ReferredUserID ),
				new SqlParameter("@DateAdded", referralMapping.DateAdded == DateTime.MinValue ? SqlDateTime.Null : referralMapping.DateAdded )
			};

			 var ReferralMappingID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ReferralMappingUpdate", parameters));
			return Ok(new {ReferralMappingID =ReferralMappingID});
			}, this);
		}

		
		/// <summary>
		/// Selects a single record from the ReferralMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ReferralMappingSelect")]
		public IActionResult ReferralMappingSelect(int referralMappingID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ReferralMappingSelect", parameters))
			{
				List<ReferralMapping> ReferralMappingList = new List<ReferralMapping>();
				while (dataReader.Read())
				{
					ReferralMapping ReferralMapping = MakeReferralMapping(dataReader);
					ReferralMappingList.Add(ReferralMapping);
				}

				return  Ok(new {ReferralMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ReferralMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ReferralMappingSelectAll")]
		public IActionResult ReferralMappingSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ReferralMappingSelectAll", parameters))
			{
				List<ReferralMapping> ReferralMappingList = new List<ReferralMapping>();
				while (dataReader.Read())
				{
					ReferralMapping ReferralMapping = MakeReferralMapping(dataReader);
					ReferralMappingList.Add(ReferralMapping);
				}

				return  Ok(new {ReferralMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ReferralMapping table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ReferralMappingSelectByQuery")]
		public  IActionResult ReferralMappingSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ReferralMappingSelectByQuery", parameters))
			{
				List<ReferralMapping> ReferralMappingList = new List<ReferralMapping>();
				while (dataReader.Read())
				{
					ReferralMapping ReferralMapping = MakeReferralMapping(dataReader);
					ReferralMappingList.Add(ReferralMapping);
				}

				return  Ok(new {ReferralMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ReferralMapping class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ReferralMapping MakeReferralMapping(SqlDataReader dataReader)
		{
			ReferralMapping referralMapping = new ReferralMapping();
			referralMapping.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			referralMapping.ReferralMappingID = DataAccess.GetInt32(dataReader, "ReferralMappingID", 0);
			referralMapping.UserReferralCodeID = DataAccess.GetInt32(dataReader, "UserReferralCodeID", 0);
			referralMapping.ReferredUserID = DataAccess.GetInt32(dataReader, "ReferredUserID", 0);
			referralMapping.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return referralMapping;
		}

	}
	}
