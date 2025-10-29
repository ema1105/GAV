package GAV.GAV.Exceptions;

public class AccessNotAunauthorizedException extends RuntimeException{
    public AccessNotAunauthorizedException(String message) {
        super(message);
    }
}
