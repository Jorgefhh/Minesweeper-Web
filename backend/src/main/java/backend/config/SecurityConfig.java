package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    //Inyección de dependencia que sirve para usar un objeto jwt...
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean  //Con esta anotación delegamos el objeto devuelto por dicho método
    //  a Spring para que pueda entregarselo a otras clases automáticamente
    //El bean se mete dentro del aplication context que es un contenedor de objetos administrados por spring
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    //Método que intercepta los datagramas http entrantes y aplica una política 
    //Esto antes de que lleguen a los controladores.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())  //Desabilitar una vulnerabilidad que no aplica al caso
            //Este siguiente linea le dice al navegador que no va a almacenar nada en su local storage ni cookie
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                //Permite acceso (SIN LOGIN) a solamente esos endpoints
                .requestMatchers("/usuarios/register", "/usuarios/login", "/api/clasificacion").permitAll()
                .anyRequest().authenticated()  
                //Defino que todos los endpoints de request restantes
                //Proporcionen si o si un jwt para acceder caso contrario se le responderá automaticamente
                //Con un código unauthorized
            )
            //Con esto pongo mi filtro personalizado para que se aplique al final de los anteriores filtros
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}