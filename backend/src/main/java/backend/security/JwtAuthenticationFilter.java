package backend.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            // en este caso response esta de onda pero podria
            // en dado escenario generar datagramas salientes
            // en caso de algun error de logica filtro
            filterChain.doFilter(request, response);
            return;
        }
        // Procesa el token después de la parte de "Bearer..."
        String token = header.substring(7);

        if (jwtService.esValido(token)) {
            System.out.println("************** TOKEN VALIDO **********");
            String correo = jwtService.extraerCorreo(token);
            usuarioRepository.findByCorreo(correo).ifPresent(usuario -> {
                // Si existe en la bd, se crea una autenticacion de spring
                // Con esto se le dice a spring que el usuario sea tratado como autenticado
                // Para los endpoints futuros

                // Se crea un obj auth
                var authentication = new UsernamePasswordAuthenticationToken(usuario, null, Collections.emptyList());
                // Y se lo mete en un security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }
        filterChain.doFilter(request, response);
    }
}