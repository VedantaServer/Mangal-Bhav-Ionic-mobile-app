using System;
namespace FaceUPAI.Models
{
	public class ProfileShare
	{
		#region Fields

		private int profileShareID;
		private int tenantID;
		private int panditUserID;
		private int sharedByUserID;
		private string iPAddress;
		private string device;
		private string source;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ProfileShare class.
		/// </summary>
		public ProfileShare()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ProfileShare class.
		/// </summary>
		public ProfileShare(int tenantID, int panditUserID, int sharedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.sharedByUserID = sharedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ProfileShare class.
		/// </summary>
		public ProfileShare(int profileShareID, int tenantID, int panditUserID, int sharedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.profileShareID = profileShareID;
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.sharedByUserID = sharedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProfileShareID value.
		/// </summary>
		public  int ProfileShareID
		{
			get { return profileShareID; }
			set { profileShareID = value; }
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
		/// Gets or sets the SharedByUserID value.
		/// </summary>
		public  int SharedByUserID
		{
			get { return sharedByUserID; }
			set { sharedByUserID = value; }
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
