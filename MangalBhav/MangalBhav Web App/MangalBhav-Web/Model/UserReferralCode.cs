using System;
namespace FaceUPAI.Models
{
	public class UserReferralCode
	{
		#region Fields

		private int userReferralCodeID;
		private int tenantID;
		private int userID;
		private string referralCode;
		private bool isActive;
		private DateTime createdDate;
		private DateTime modifiedDate;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode()
		{
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode(int tenantID, int userID, string referralCode, bool isActive, DateTime createdDate, DateTime modifiedDate)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.referralCode = referralCode;
			this.isActive = isActive;
			this.createdDate = createdDate;
			this.modifiedDate = modifiedDate;
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode(int userReferralCodeID, int tenantID, int userID, string referralCode, bool isActive, DateTime createdDate, DateTime modifiedDate)
		{
			this.userReferralCodeID = userReferralCodeID;
			this.tenantID = tenantID;
			this.userID = userID;
			this.referralCode = referralCode;
			this.isActive = isActive;
			this.createdDate = createdDate;
			this.modifiedDate = modifiedDate;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the UserReferralCodeID value.
		/// </summary>
		public  int UserReferralCodeID
		{
			get { return userReferralCodeID; }
			set { userReferralCodeID = value; }
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
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the ReferralCode value.
		/// </summary>
		public  string ReferralCode
		{
			get { return referralCode; }
			set { referralCode = value; }
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
		/// Gets or sets the CreatedDate value.
		/// </summary>
		public  DateTime CreatedDate
		{
			get { return createdDate; }
			set { createdDate = value; }
		}

		/// <summary>
		/// Gets or sets the ModifiedDate value.
		/// </summary>
		public  DateTime ModifiedDate
		{
			get { return modifiedDate; }
			set { modifiedDate = value; }
		}

		#endregion
	}
}
