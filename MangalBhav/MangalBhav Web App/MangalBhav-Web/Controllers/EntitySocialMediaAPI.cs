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
	public class EntitySocialMediaAPI : ControllerBase
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
		/// Saves a record to the EntitySocialMedia table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaInsert")]
		public  IActionResult EntitySocialMediaInsert([FromBody] EntitySocialMedia entitySocialMedia)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", entitySocialMedia.TenantID == 0 ? SqlInt32.Null : entitySocialMedia.TenantID ),
				new SqlParameter("@EntityType", entitySocialMedia.EntityType),
				new SqlParameter("@EntityID", entitySocialMedia.EntityID == 0 ? SqlInt32.Null : entitySocialMedia.EntityID ),
				new SqlParameter("@Platform", entitySocialMedia.Platform),
				new SqlParameter("@Link", entitySocialMedia.Link),
				new SqlParameter("@Username", entitySocialMedia.Username),
				new SqlParameter("@DisplayName", entitySocialMedia.DisplayName),
				new SqlParameter("@IsVerified", entitySocialMedia.IsVerified),
				new SqlParameter("@IsActive", entitySocialMedia.IsActive),
				new SqlParameter("@DateAdded", entitySocialMedia.DateAdded == DateTime.MinValue ? SqlDateTime.Null : entitySocialMedia.DateAdded ),
				new SqlParameter("@DateModified", entitySocialMedia.DateModified == DateTime.MinValue ? SqlDateTime.Null : entitySocialMedia.DateModified ),
				new SqlParameter("@AddedByUser", entitySocialMedia.AddedByUser),
				new SqlParameter("@UpdatedByUser", entitySocialMedia.UpdatedByUser)
			};

			entitySocialMedia.EntitySocialMediaID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "EntitySocialMediaInsert", parameters));
			return Ok(new {EntitySocialMediaID=entitySocialMedia.EntitySocialMediaID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the EntitySocialMedia table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaUpdate")]
		public  IActionResult EntitySocialMediaUpdate([FromBody] EntitySocialMedia entitySocialMedia)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@EntitySocialMediaID", entitySocialMedia.EntitySocialMediaID == 0 ? SqlInt32.Null : entitySocialMedia.EntitySocialMediaID ),
				new SqlParameter("@TenantID", entitySocialMedia.TenantID == 0 ? SqlInt32.Null : entitySocialMedia.TenantID ),
				new SqlParameter("@EntityType", entitySocialMedia.EntityType),
				new SqlParameter("@EntityID", entitySocialMedia.EntityID == 0 ? SqlInt32.Null : entitySocialMedia.EntityID ),
				new SqlParameter("@Platform", entitySocialMedia.Platform),
				new SqlParameter("@Link", entitySocialMedia.Link),
				new SqlParameter("@Username", entitySocialMedia.Username),
				new SqlParameter("@DisplayName", entitySocialMedia.DisplayName),
				new SqlParameter("@IsVerified", entitySocialMedia.IsVerified),
				new SqlParameter("@IsActive", entitySocialMedia.IsActive),
				new SqlParameter("@DateAdded", entitySocialMedia.DateAdded == DateTime.MinValue ? SqlDateTime.Null : entitySocialMedia.DateAdded ),
				new SqlParameter("@DateModified", entitySocialMedia.DateModified == DateTime.MinValue ? SqlDateTime.Null : entitySocialMedia.DateModified ),
				new SqlParameter("@AddedByUser", entitySocialMedia.AddedByUser),
				new SqlParameter("@UpdatedByUser", entitySocialMedia.UpdatedByUser)
			};

			 var EntitySocialMediaID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "EntitySocialMediaUpdate", parameters));
			return Ok(new {EntitySocialMediaID =EntitySocialMediaID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the EntitySocialMedia table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaDelete")]
		public  IActionResult EntitySocialMediaDelete(int entitySocialMediaID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@EntitySocialMediaID", entitySocialMediaID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var entitySocialMediaDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "EntitySocialMediaDelete", parameters));
			return Ok(new {EntitySocialMediaID =entitySocialMediaDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the EntitySocialMedia table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaSelect")]
		public IActionResult EntitySocialMediaSelect(int entitySocialMediaID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@EntitySocialMediaID", entitySocialMediaID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "EntitySocialMediaSelect", parameters))
			{
				List<EntitySocialMedia> EntitySocialMediaList = new List<EntitySocialMedia>();
				while (dataReader.Read())
				{
					EntitySocialMedia EntitySocialMedia = MakeEntitySocialMedia(dataReader);
					EntitySocialMediaList.Add(EntitySocialMedia);
				}

				return  Ok(new {EntitySocialMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the EntitySocialMedia table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaSelectAll")]
		public IActionResult EntitySocialMediaSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "EntitySocialMediaSelectAll", parameters))
			{
				List<EntitySocialMedia> EntitySocialMediaList = new List<EntitySocialMedia>();
				while (dataReader.Read())
				{
					EntitySocialMedia EntitySocialMedia = MakeEntitySocialMedia(dataReader);
					EntitySocialMediaList.Add(EntitySocialMedia);
				}

				return  Ok(new {EntitySocialMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the EntitySocialMedia table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaSelectAllByTenantID")]
		public  IActionResult EntitySocialMediaSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "EntitySocialMediaSelectAllByTenantID", parameters))
			{
				List<EntitySocialMedia> EntitySocialMediaList = new List<EntitySocialMedia>();
				while (dataReader.Read())
				{
					EntitySocialMedia EntitySocialMedia = MakeEntitySocialMedia(dataReader);
					EntitySocialMediaList.Add(EntitySocialMedia);
				}

				return  Ok(new {EntitySocialMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the EntitySocialMedia table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("EntitySocialMediaSelectByQuery")]
		public  IActionResult EntitySocialMediaSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "EntitySocialMediaSelectByQuery", parameters))
			{
				List<EntitySocialMedia> EntitySocialMediaList = new List<EntitySocialMedia>();
				while (dataReader.Read())
				{
					EntitySocialMedia EntitySocialMedia = MakeEntitySocialMedia(dataReader);
					EntitySocialMediaList.Add(EntitySocialMedia);
				}

				return  Ok(new {EntitySocialMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the EntitySocialMedia class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  EntitySocialMedia MakeEntitySocialMedia(SqlDataReader dataReader)
		{
			EntitySocialMedia entitySocialMedia = new EntitySocialMedia();
			entitySocialMedia.EntitySocialMediaID = DataAccess.GetInt32(dataReader, "EntitySocialMediaID", 0);
			entitySocialMedia.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			entitySocialMedia.EntityType = DataAccess.GetString(dataReader, "EntityType", String.Empty);
			entitySocialMedia.EntityID = DataAccess.GetInt32(dataReader, "EntityID", 0);
			entitySocialMedia.Platform = DataAccess.GetString(dataReader, "Platform", String.Empty);
			entitySocialMedia.Link = DataAccess.GetString(dataReader, "Link", String.Empty);
			entitySocialMedia.Username = DataAccess.GetString(dataReader, "Username", String.Empty);
			entitySocialMedia.DisplayName = DataAccess.GetString(dataReader, "DisplayName", String.Empty);
			entitySocialMedia.IsVerified = DataAccess.GetBoolean(dataReader, "IsVerified", false);
			entitySocialMedia.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			entitySocialMedia.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			entitySocialMedia.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			entitySocialMedia.AddedByUser = DataAccess.GetString(dataReader, "AddedByUser", String.Empty);
			entitySocialMedia.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return entitySocialMedia;
		}

	}
	}
