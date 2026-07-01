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
	public class ProfileViewAPI : ControllerBase
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
		/// Saves a record to the ProfileViews table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewsInsert")]
		public  IActionResult ProfileViewsInsert([FromBody] ProfileView profileView)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", profileView.TenantID == 0 ? SqlInt32.Null : profileView.TenantID ),
				new SqlParameter("@PanditUserID", profileView.PanditUserID == 0 ? SqlInt32.Null : profileView.PanditUserID ),
				new SqlParameter("@ViewedByUserID", profileView.ViewedByUserID == 0 ? SqlInt32.Null : profileView.ViewedByUserID ),
				new SqlParameter("@IPAddress", profileView.IPAddress),
				new SqlParameter("@Device", profileView.Device),
				new SqlParameter("@Source", profileView.Source),
				new SqlParameter("@DateAdded", profileView.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileView.DateAdded )
			};

			profileView.ProfileViewID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileViewsInsert", parameters));
			return Ok(new {ProfileViewID=profileView.ProfileViewID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ProfileViews table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewsUpdate")]
		public  IActionResult ProfileViewsUpdate([FromBody] ProfileView profileView)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileViewID", profileView.ProfileViewID == 0 ? SqlInt32.Null : profileView.ProfileViewID ),
				new SqlParameter("@TenantID", profileView.TenantID == 0 ? SqlInt32.Null : profileView.TenantID ),
				new SqlParameter("@PanditUserID", profileView.PanditUserID == 0 ? SqlInt32.Null : profileView.PanditUserID ),
				new SqlParameter("@ViewedByUserID", profileView.ViewedByUserID == 0 ? SqlInt32.Null : profileView.ViewedByUserID ),
				new SqlParameter("@IPAddress", profileView.IPAddress),
				new SqlParameter("@Device", profileView.Device),
				new SqlParameter("@Source", profileView.Source),
				new SqlParameter("@DateAdded", profileView.DateAdded == DateTime.MinValue ? SqlDateTime.Null : profileView.DateAdded )
			};

			 var ProfileViewID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProfileViewsUpdate", parameters));
			return Ok(new {ProfileViewID =ProfileViewID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ProfileViews table by its primary key.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewsDelete")]
		public  IActionResult ProfileViewsDelete(int profileViewID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileViewID", profileViewID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var profileViewsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProfileViewsDelete", parameters));
			return Ok(new {ProfileViewsID =profileViewsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileViews table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewSelect")]
		public IActionResult ProfileViewSelect(int profileViewID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileViewID", profileViewID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileViewsSelect", parameters))
			{
				List<ProfileView> ProfileViewList = new List<ProfileView>();
				while (dataReader.Read())
				{
					ProfileView ProfileView = MakeProfileView(dataReader);
					ProfileViewList.Add(ProfileView);
				}

				return  Ok(new {ProfileViewList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProfileViews table.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewSelectAll")]
		public IActionResult ProfileViewSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProfileViewsSelectAll", parameters))
			{
				List<ProfileView> ProfileViewList = new List<ProfileView>();
				while (dataReader.Read())
				{
					ProfileView ProfileView = MakeProfileView(dataReader);
					ProfileViewList.Add(ProfileView);
				}

				return  Ok(new {ProfileViewList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ProfileViews table by a ak=ll query.
		/// </summary>
	[HttpPost]
	 [EnableCors("AllowAll")]
	[Route("ProfileViewsSelectByQuery")]
		public  IActionResult ProfileViewsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProfileViewsSelectByQuery", parameters))
			{
				List<ProfileView> ProfileViewList = new List<ProfileView>();
				while (dataReader.Read())
				{
					ProfileView ProfileView = MakeProfileView(dataReader);
					ProfileViewList.Add(ProfileView);
				}

				return  Ok(new {ProfileViewList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ProfileViews class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ProfileView MakeProfileView(SqlDataReader dataReader)
		{
			ProfileView profileView = new ProfileView();
			profileView.ProfileViewID = DataAccess.GetInt32(dataReader, "ProfileViewID", 0);
			profileView.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			profileView.PanditUserID = DataAccess.GetInt32(dataReader, "PanditUserID", 0);
			profileView.ViewedByUserID = DataAccess.GetInt32(dataReader, "ViewedByUserID", 0);
			profileView.IPAddress = DataAccess.GetString(dataReader, "IPAddress", String.Empty);
			profileView.Device = DataAccess.GetString(dataReader, "Device", String.Empty);
			profileView.Source = DataAccess.GetString(dataReader, "Source", String.Empty);
			profileView.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return profileView;
		}

	}
	}
