package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


//RECORDAR EL DTO DEBE TENER LOS ATRIBUTOS EXACTAMENTE IGUAL QUE LOS CAMPOS JSON DEL FRONTEND, SINO DARÁ ERROR
@Getter @Setter 
public class RegisterRequest {
    //1 atributo:
    @NotBlank (message = "El nombre de usuario es obligatorio.")
    @Size (min = 3, max = 20, message = "El nombre debe tener entre 3 y 20 caracteres.")
    private String nombreUsuario;

    //2 atributo:
    @NotBlank (message = "El mensaje no puede estar vacío.")
    private String pais;

    //3 atributo:
    @NotBlank (message = "El correo no puede estar vacío.")
    @Email (message =  "El formato de correo no es válido.")
    private String correo;

    //4 atributo:
    @NotBlank (message = "La contraseña no puede estar vacía")
    @Size (min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;




}
