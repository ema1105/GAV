package GAV.GAV.Exceptions;

public class DuplicateUserNameException extends RuntimeException{
    public DuplicateUserNameException(String message){
        super(message);
    }
}
