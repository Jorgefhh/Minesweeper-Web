package backend.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import backend.dto.RegisterRequest;
import backend.exception.CredencialesInvalidasException;
import backend.exception.RecursoDuplicadoException;
import backend.model.Usuario;
import backend.repository.UsuarioRepository;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrar(RegisterRequest userRequest) {
        if (usuarioRepository.findByCorreo(userRequest.getCorreo()).isPresent()) {
            throw new RecursoDuplicadoException("El correo ingresado ya se encuentra en uso.");
        }
        Usuario usuario = new Usuario();
        usuario.setCorreo(userRequest.getCorreo().trim());
        usuario.setPassword(userRequest.getPassword().trim());
        usuario.setNombreUsuarios(userRequest.getNombreUsuario().trim());
        // Hashea la contraseña con bcrypt para seguridad
        // Además se inicializa los datos de la tabla usuario por primera vez
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setFechaInicio(LocalDate.now());
        usuario.setExperiencia(0);
        return usuarioRepository.save(usuario); // Llama al repository y le pasa los datos recién procesados
    }

    public Usuario login(String correo, String password) {

        // Busca en la BD si está un usuario asociado a ese correo, caso afirmativo
        // Verifica que la pass sea correcta, si todo sale bien el login acontece

        // Ahora con el global exception handler no necesito usar try catch.
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

        if (!usuarioOpt.isPresent() || (!passwordEncoder.matches(password, usuarioOpt.get().getPassword()))) {
            throw new CredencialesInvalidasException("Credenciales invalidas.");
        }

        Usuario usuario = usuarioOpt.get();
        // Si llega acá las credenciales son correctas:
        // System.out.println("Login exitoso.");
        return usuario;
    }
}