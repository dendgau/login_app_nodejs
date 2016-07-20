var DISCONNECTED = 0;

function UserModel(mongoose) {
    this.mongoose = mongoose;
    this.hostName = "mongodb://dendgau:dendgau@ds023425.mlab.com:23425/login_app_nodejs";

    this.modelUser
    try {
        this.modelUser = mongoose.model('User');
    } catch (error) {
        var userSchema = new mongoose.Schema({
            firstName     : String,
            lastName      : String,
            emailAddress  : String,
            password      : String
        });
        this.modelUser = mongoose.model('User', userSchema);
    }

    this.addUser = function(dataUser) {
        this.connectMongolab();
        var instance = new this.modelUser();
        instance.firstName = dataUser.firstName;
        instance.lastName = dataUser.lastName;
        instance.emailAddress = dataUser.emailAddress;
        instance.password = dataUser.password;
        instance.save();
    }

    this.checkEmailIsExist = function(email) {
        this.connectMongolab();
        return this.modelUser.find({"emailAddress": email}).exec();
    }

    this.connectMongolab = function() {
      if (this.getStateConnection() == DISCONNECTED)
        this.mongoose.connect(this.hostName);
    }

    this.getStateConnection = function() {
      return this.mongoose.connection.readyState
    }

    return this;
}

module.exports = UserModel;