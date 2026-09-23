package backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.dto.LoginRequest;
import backend.dto.LoginResponse;
import backend.dto.RegisterRequest;
import backend.model.Usuario;
import backend.security.JwtService;
import backend.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("register")
    public ResponseEntity<Usuario> registrar(@Valid @RequestBody RegisterRequest usuario) {
        Usuario creado = usuarioService.registrar(usuario);
        // creado.setPassword(null); // nunca devolver el hash, porque se supone que es
        // un secreto
        // Me imagino que lo de arriba lo hará por alguna convención de seguridad o no
        // sé.
        return ResponseEntity.ok(creado);
        // el objetivo de registrar es persistir la información del usuario, no es
        // generar una sesión.
    }

    // El objetivo del login aquí es dar una sesión, necesita como requisito que
    // exista en la BD la información del usuario.
    @PostMapping("login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.login(request.getCorreo(), request.getPassword());
        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(token, usuario.getNombreUsuarios(), usuario.getCorreo()));
    }
}