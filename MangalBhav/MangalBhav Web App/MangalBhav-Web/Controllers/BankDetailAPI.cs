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
	public class BankDetailAPI : ControllerBase
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
		/// Saves a record to the BankDetails table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailsInsert")]
		public  IActionResult BankDetailsInsert([FromBody] BankDetail bankDetail)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantId", bankDetail.TenantId == 0 ? SqlInt32.Null : bankDetail.TenantId ),
				new SqlParameter("@UserID", bankDetail.UserID == 0 ? SqlInt32.Null : bankDetail.UserID ),
				new SqlParameter("@AccountHolderName", bankDetail.AccountHolderName),
				new SqlParameter("@BankName", bankDetail.BankName),
				new SqlParameter("@AccountNumber", bankDetail.AccountNumber),
				new SqlParameter("@IFSCCode", bankDetail.IFSCCode),
				new SqlParameter("@BranchName", bankDetail.BranchName),
				new SqlParameter("@UPIId", bankDetail.UPIId),
				new SqlParameter("@AccountType", bankDetail.AccountType),
				new SqlParameter("@IsActive", bankDetail.IsActive),
				new SqlParameter("@DateAdded", bankDetail.DateAdded == DateTime.MinValue ? SqlDateTime.Null : bankDetail.DateAdded ),
				new SqlParameter("@DateModified", bankDetail.DateModified == DateTime.MinValue ? SqlDateTime.Null : bankDetail.DateModified ),
				new SqlParameter("@UpdatedByUser", bankDetail.UpdatedByUser == 0 ? SqlInt32.Null : bankDetail.UpdatedByUser )
			};

			bankDetail.BankDetailsId = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "BankDetailsInsert", parameters));
			return Ok(new {BankDetailsId=bankDetail.BankDetailsId});
			}, this);
		}

		/// <summary>
		/// Updates a record in the BankDetails table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailsUpdate")]
		public  IActionResult BankDetailsUpdate([FromBody] BankDetail bankDetail)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BankDetailsId", bankDetail.BankDetailsId == 0 ? SqlInt32.Null : bankDetail.BankDetailsId ),
				new SqlParameter("@TenantId", bankDetail.TenantId == 0 ? SqlInt32.Null : bankDetail.TenantId ),
				new SqlParameter("@UserID", bankDetail.UserID == 0 ? SqlInt32.Null : bankDetail.UserID ),
				new SqlParameter("@AccountHolderName", bankDetail.AccountHolderName),
				new SqlParameter("@BankName", bankDetail.BankName),
				new SqlParameter("@AccountNumber", bankDetail.AccountNumber),
				new SqlParameter("@IFSCCode", bankDetail.IFSCCode),
				new SqlParameter("@BranchName", bankDetail.BranchName),
				new SqlParameter("@UPIId", bankDetail.UPIId),
				new SqlParameter("@AccountType", bankDetail.AccountType),
				new SqlParameter("@IsActive", bankDetail.IsActive),
				new SqlParameter("@DateAdded", bankDetail.DateAdded == DateTime.MinValue ? SqlDateTime.Null : bankDetail.DateAdded ),
				new SqlParameter("@DateModified", bankDetail.DateModified == DateTime.MinValue ? SqlDateTime.Null : bankDetail.DateModified ),
				new SqlParameter("@UpdatedByUser", bankDetail.UpdatedByUser == 0 ? SqlInt32.Null : bankDetail.UpdatedByUser )
			};

			 var BankDetailID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "BankDetailsUpdate", parameters));
			return Ok(new {BankDetailID =BankDetailID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the BankDetails table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailsDelete")]
		public  IActionResult BankDetailsDelete(int bankDetailsId, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BankDetailsId", bankDetailsId)

				,new SqlParameter("@TenantID", tenantID)			};

			 var bankDetailsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "BankDetailsDelete", parameters));
			return Ok(new {BankDetailsID =bankDetailsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the BankDetails table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailSelect")]
		public IActionResult BankDetailSelect(int bankDetailsId,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BankDetailsId", bankDetailsId)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "BankDetailsSelect", parameters))
			{
				List<BankDetail> BankDetailList = new List<BankDetail>();
				while (dataReader.Read())
				{
					BankDetail BankDetail = MakeBankDetail(dataReader);
					BankDetailList.Add(BankDetail);
				}

				return  Ok(new {BankDetailList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the BankDetails table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailSelectAll")]
		public IActionResult BankDetailSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "BankDetailsSelectAll", parameters))
			{
				List<BankDetail> BankDetailList = new List<BankDetail>();
				while (dataReader.Read())
				{
					BankDetail BankDetail = MakeBankDetail(dataReader);
					BankDetailList.Add(BankDetail);
				}

				return  Ok(new {BankDetailList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the BankDetails table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BankDetailsSelectByQuery")]
		public  IActionResult BankDetailsSelectByQuery(int tenantID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),								new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "BankDetailsSelectByQuery", parameters))
			{
				List<BankDetail> BankDetailList = new List<BankDetail>();
				while (dataReader.Read())
				{
					BankDetail BankDetail = MakeBankDetail(dataReader);
					BankDetailList.Add(BankDetail);
				}

				return  Ok(new {BankDetailList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the BankDetails class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  BankDetail MakeBankDetail(SqlDataReader dataReader)
		{
			BankDetail bankDetail = new BankDetail();
			bankDetail.BankDetailsId = DataAccess.GetInt32(dataReader, "BankDetailsId", 0);
			bankDetail.TenantId = DataAccess.GetInt32(dataReader, "TenantId", 0);
			bankDetail.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			bankDetail.AccountHolderName = DataAccess.GetString(dataReader, "AccountHolderName", String.Empty);
			bankDetail.BankName = DataAccess.GetString(dataReader, "BankName", String.Empty);
			bankDetail.AccountNumber = DataAccess.GetString(dataReader, "AccountNumber", String.Empty);
			bankDetail.IFSCCode = DataAccess.GetString(dataReader, "IFSCCode", String.Empty);
			bankDetail.BranchName = DataAccess.GetString(dataReader, "BranchName", String.Empty);
			bankDetail.UPIId = DataAccess.GetString(dataReader, "UPIId", String.Empty);
			bankDetail.AccountType = DataAccess.GetString(dataReader, "AccountType", String.Empty);
			bankDetail.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			bankDetail.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			bankDetail.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			bankDetail.UpdatedByUser = DataAccess.GetInt32(dataReader, "UpdatedByUser", 0);

			return bankDetail;
		}

	}
	}
