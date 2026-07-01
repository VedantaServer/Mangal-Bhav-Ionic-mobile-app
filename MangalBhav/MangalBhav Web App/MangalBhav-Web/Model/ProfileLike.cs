using System;
namespace FaceUPAI.Models
{
	public class ProfileLike
	{
		#region Fields

		private int profileLikeID;
		private int tenantID;
		private int panditUserID;
		private int likedByUserID;
		private string iPAddress;
		private string device;
		private string source;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ProfileLike class.
		/// </summary>
		public ProfileLike()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ProfileLike class.
		/// </summary>
		public ProfileLike(int tenantID, int panditUserID, int likedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.likedByUserID = likedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ProfileLike class.
		/// </summary>
		public ProfileLike(int profileLikeID, int tenantID, int panditUserID, int likedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.profileLikeID = profileLikeID;
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.likedByUserID = likedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProfileLikeID value.
		/// </summary>
		public  int ProfileLikeID
		{
			get { return profileLikeID; }
			set { profileLikeID = value; }
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
		/// Gets or sets the PanditUserID value.
		/// </summary>
		public  int PanditUserID
		{
			get { return panditUserID; }
			set { panditUserID = value; }
		}

		/// <summary>
		/// Gets or sets the LikedByUserID value.
		/// </summary>
		public  int LikedByUserID
		{
			get { return likedByUserID; }
			set { likedByUserID = value; }
		}

		/// <summary>
		/// Gets or sets the IPAddress value.
		/// </summary>
		public  string IPAddress
		{
			get { return iPAddress; }
			set { iPAddress = value; }
		}

		/// <summary>
		/// Gets or sets the Device value.
		/// </summary>
		public  string Device
		{
			get { return device; }
			set { device = value; }
		}

		/// <summary>
		/// Gets or sets the Source value.
		/// </summary>
		public  string Source
		{
			get { return source; }
			set { source = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		#endregion
	}
}
