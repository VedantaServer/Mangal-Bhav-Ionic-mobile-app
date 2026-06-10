using System;
namespace FaceUPAI.Models
{
	public class MandirMember
	{
		#region Fields

		private int mandirMemberID;
		private int tenantID;
		private int mandirID;
		private int userID;
		private string memberRole;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MandirMember class.
		/// </summary>
		public MandirMember()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MandirMember class.
		/// </summary>
		public MandirMember(int mandirMemberID, int tenantID, int mandirID, int userID, string memberRole, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.mandirMemberID = mandirMemberID;
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.userID = userID;
			this.memberRole = memberRole;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MandirMemberID value.
		/// </summary>
		public  int MandirMemberID
		{
			get { return mandirMemberID; }
			set { mandirMemberID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the MandirID value.
		/// </summary>
		public  int MandirID
		{
			get { return mandirID; }
			set { mandirID = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the MemberRole value.
		/// </summary>
		public  string MemberRole
		{
			get { return memberRole; }
			set { memberRole = value; }
		}

		/// <summary>
		/// Gets or sets the IsActive value.
		/// </summary>
		public  bool IsActive
		{
			get { return isActive; }
			set { isActive = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
