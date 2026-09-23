package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.validation.FieldError;

import backend.dto.ErrorResponse;

@ControllerAdvice // Esto me permite crear endpoints mapeados no a http request sino que a cierto
                  // tipo de excepciones:
public class GlobalExceptionHandler {

    // 1. Errores en la validación de Spring -> Los lanza @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidaciones(MethodArgumentNotValidException ex) {
        StringBuilder descripcion = new StringBuilder();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            if (descripcion.length() > 0) {
                descripcion.append("\n");
            }

            descripcion.append(error.getField())
                    .append(": ")
                    .append(error.getDefaultMessage());
        }

        ErrorResponse respuesta = new ErrorResponse(
                "ERROR",
                "VALIDACION FALLIDA",
                descripcion.toString());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    // 2. Errores de lógica de negocio: Ejemplo una dificultad invalida llegada.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> manejarArgumentoInvalido(IllegalArgumentException ex) {
        // Creo el objeto dto y lo mando como body:
        ErrorResponse error = new ErrorResponse("ERROR", "ARGUMENTO INVALIDO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // 3.Errores a la hora de ingresar las credenciales:
    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorResponse> manejarErrorCredencial(CredencialesInvalidasException ex) {
        ErrorResponse error = new ErrorResponse("ERROR", "ACCESO NO AUTORIZADO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // 4.Errores con recursos duplicados:
    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<ErrorResponse> manejarErrorDuplicado(RecursoDuplicadoException ex) {
        ErrorResponse error = new ErrorResponse("ERROR", "RECURSO DUPLICADO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}
