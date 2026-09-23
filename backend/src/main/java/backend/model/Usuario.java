package backend.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Table("Usuarios")
@Getter
@Setter
public class Usuario {
    //Arranco poniendo los atributos:
    @Id
    @Column("idUsuarios")
    private Integer idUsuarios;
    @Column ("nombreUsuarios")  //Exige a spring a consultar explicitamente con estos nombres los atributos de la bd en el repo
    private String nombreUsuarios;
    @Column ("correo")
    private String correo;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) //RECIBE EL JSON DE REQUEST PERO NO MANDA NADA EN RESPONSE
    private String password;
    @Column("foto")
    private String foto;
    @Column("fechaInicio")
    private LocalDate fechaInicio;
    @Column("experiencia")
    private Integer experiencia;

    

}
