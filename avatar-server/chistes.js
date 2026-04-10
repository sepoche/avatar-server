// File: chistes.js

// Función para obtener un chiste aleatorio
export function getRandomJoke() {
    const randomIndex = Math.floor(Math.random() * JOKES_DB.length);
    return JOKES_DB[randomIndex].text;
}

// function to get a joke by category
export function getJokeByCategory(category) {
    const lowerCategory = (category || "").toLowerCase();
    const jokesInCategory = JOKES_DB.filter(joke => joke.category === lowerCategory);
    if (lowerCategory === "random") {
        return getRandomJoke();
    }

    if (!lowerCategory) {
        return getRandomJoke();
    }

    if (jokesInCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * jokesInCategory.length);
        return jokesInCategory[randomIndex].text;
    }
    return "No hay chistes disponibles para esta categoría.";
}

//funcion para añadir un chiste nuevo
export function addJoke(category, text) {
    const newJoke = {
        id: JOKES_DB.length + 1,
        category,
        text
    };
    JOKES_DB.push(newJoke);
    return newJoke;
}


//funccion para detectar categoria de chiste en el texto
export function detectJokeCategory(text) {
    text = text.toLowerCase();
    if (text.includes("general")) return "general";
    if (text.includes("tecnología")) return "tecnología";
    if (text.includes("animales")) return "animales";
    if (text.includes("negro")) return "negro";
    if (text.includes("verde")) return "verde";
    return "random"; // por defecto
}

// Base de datos simple de chistes
const JOKES_DB = [
    { id: 1, category: "general", text: "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter." },
    { id: 2, category: "tecnología", text: "¿Por qué los programadores confunden Halloween con Navidad? Porque OCT 31 == DEC 25." },
    { id: 3, category: "animales", text: "¿Qué le dijo un pez a otro pez? ¡Nada!" },
    { id: 4, category: "general", text: "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!" },
    { id: 5, category: "tecnología", text: "¿Cómo se llama un oso sin dientes? ¡Un oso 'gummy'!" },
    { id: 6, category: "animales", text: "¿Por qué los elefantes no usan ordenador? Porque le tienen miedo al ratón." },
    { id: 7, category: "negro", text: "-Papá que es ¿el humor negro? -¿ves ése hombre sin brazos? Dile que aplauda. -pero papá soy ciego.  -Exacto." },
    { id: 8, category: "verde", text: "-¡Hija! ¿Por qué hay semen en tus sábanas? -No sé mamá, no sé… pensé que me lo había tragado todo." },
    { id: 9, category: "verde", text: "Amor, ¿este jean me hace ver gorda? -¿Jurame que no te vas a enfadar si te digo la verdad? -Ay no. Te lo juro, solo dilo. -Me follé a tu hermana."},
    { id: 10, category: "verde", text: "Me compré unas bragas blancas. -¿Qué marca? -To´l coño."},
    { id: 11, category: "general", text: "-Ya está la comida, amor. ¿Te sirvo? -A veces..."},
    { id: 12, category: "general", text: "-Me veo gorda, flácida, arrugada y vieja. ¡Dime algo positivo! -Tienes buena vista."},
    { id: 13, category: "negro", text: "Mientras tanto, en China: -Mami, papi, ¡quiero un perro! -¿Pata o muslo?"},
    { id: 14, category: "general", text: "-¡Felicitaciones hija! ¿Así que te premiaron en el extranjero? -Preñaron mamá, preñaron…"},
    { id: 15, category: "general", text: "¿Qué le dice un jardinero a otro? -Disfruta mientras puedas, que la primavera la sangre altera." },
    { id: 16, category: "tecnología", text: "¿Por qué los robots nunca tienen miedo? Porque tienen nervios de acero." },
    { id: 17, category: "general", text: "-Cariño, tenemos que hablar, tengo un problema. -Ay gordo se dice «Tenemos», tus problemas también son los míos. -Está bien, hemos preñado a la secretaria." },
    { id: 18, category: "verde", text: "Una pareja en la cama, la chica aburrida le dice: -Amor, ¡dime un trabalenguas! -Mi polla. -Ay pero mi amor eso no es un trabalendddghujugghjas!" },
    { id: 19, category: "negro", text: "¿Cuál es el colmo de un ciego? Que su mujer le pida el divorcio por no verla más." },
    { id: 20, category: "negro", text: "¿Qué hace un negro vomitando? Presumir de que comió"},
    { id: 21, category: "negro", text: "¿Porqué los negros son zurdos? Porque no tienen derechos"},
    { id: 22, category: "negro", text: "¿Por qué no tiran bombas a África? Porque no encuentran el blanco"},
    { id: 23, category: "negro", text: "Dos amigos se encuentran y le dice uno al otro: 'Oye, ¿tu abuela es mecanica?' 'No, ¿por qué?' 'Porque la he visto en la autopista debajo de un camión.'"},
    { id: 24, category:	"Verde", text: "¿Qué diferencia hay entre amar y querer? -Tragar o escupir."},							
    { id: 25, category:	"negro", text: "¿Sabes que es lo bonito de matar a una puta en casa? Que el segundo polvo es gratis."}, 							
    { id: 26, category: "negro", text: "¿Que pasa si se inunda un geriátrico? Sopa de vegetales." },
    { id: 27, category: "negro", text: "¿Donde encuentras un perrito sin piernas? Donde lo dejaste."},							
    { id: 28, category: "negro", text:"¿Que tiene cincuenta piernas y no camina? Veinticinco discapacitados."},							
    { id: 29, category: "negro", text: "Sabes cuántas mujeres hacen falta para hacer una marcha feminista? Una menos."},
    { id: 30, category: "negro", text: "-Papá, papá, ¿por qué hay gente negra? -Pues hijo, es que cuando Dios repartió el color, ellos llegaron tarde."},
    { id: 31, category: "negro", text: "Papá, papá, ¿por qué hay un rey mago negro? -Pues hijo, es que en princípio iba a ser un regalo..."},
    { id: 32, category: "general", text: "¿Qué le dice un semáforo a otro? -No me mires, ¡me estoy cambiando!"},
    { id: 33, category: "verde", text: "Un hombre se dirige a la salida de un pub, preguntando al camarero: 'La salida ¿dónde está?' A lo que el camarero responde: '¡Justo esa del vestido rojo!' 'No, la salida de emergencia...' 'Ah, aquella rellenita de gafas.'"},
    { id: 34, category: "verde", text: "Hijo entra en la ducha: 'Mamá, ¿me enjabonas la espalda?' 'Claro, hijo... y la polla también, que ya estás grande' 'Mamá, ¿por qué me la chupas?' 'Porque tu padre se fue con la secretaria... y alguien tiene que tragar la leche de familia.'"},
    { id: 35, category: "verde", text: "Un hombre llega a su casa con un ramo de flores. Su esposa lo mira y dice: '¡A ver! ¿Ahora qué hiciste?' 'Nada, mi amor, es nuestro aniversario.' '¡Ajá! O sea que ahora me tengo que abrir de piernas...' '¿No tienes un jarrón donde ponerlas?'" },
    { id: 36, category: "general", text: "'Oiga, ¿el otorrino va por número?' 'Van nombrando.' 'Qué gran actor, pero no me cambie de tema.'"},
    { id: 37, category: "general", text: "¿Por qué las mujeres de Lepe beben agua del mar? Para ser más saladas."},
    { id: 38, category: "general", text: "¿Qué es rojo y tiene forma de cubo? Un cubo azul pintado de rojo."},
    { id: 39, category: "general", text: "Van dos ciegos y le dice uno al otro: 'Ojalá lloviera.' 'Ojalá yo también.'"},
    { id: 40, category: "general", text: "Dos vascos a la salida de un examen de matemáticas. 'Oye, Iñaki, ¿a ti que te dio el segundo problema?' '¿A mí? Infinito.' '¿Solo?'"},
    { id: 40, category: "general", text: "Van dos fantasmas y se cae el del médium."},
    { id: 41, category: "general", text: "'¿Cuánto cuesta alquilar este coche?' 'Depende del tiempo.' 'Vale, pongamos que llueve...'"},
    { id: 42, category: "general", text: "'¿Cuál es tu plato favorito?' 'Pues el hondo, porque cabe más comida.'" },
    { id: 43, category: "general", text: "'¿Sabes cómo se queda un mago después de comer? ¡Magordito!'" },
    { id: 44, category: "general", text: "'¿Qué le dice una iguana a su hermana gemela? ¡Iguanita!'" },
    { id: 45, category: "general", text: "'¿Cómo se saluda un quimico? '¡H O La!'" },
    { id: 46, category: "general", text: "'¿Qué le dice un jardinero a otro? ¡Disfrutemos mientras podamos!'" },
    { id: 47, category: "animales", text: "'¿Qué hace un perro con un taladro?' 'Ta-ladrando'" },
    { id: 48, category: "animales", text: "'¿Qué hace un pez? ¡Nada!'" },
    { id: 49, category: "general", text: "'¿Qué le dice un techo a otro? Techo de menos.'" },
    { id: 50, category: "general", text: "'¿Cómo se despiden los químicos? Ácido un placer.'" },
    { id: 51, category: "animales", text: "'¿Qué hace una vaca cuando sale el sol? Sombra.'" },
    { id: 52, category: "tecnología", text: "'¿Por qué el ordenador fue al médico?' 'Porque tenía un virus.'" },
    { id: 53, category: "tecnología", text: "'¿Qué hace un informático cuando tiene frío?' '¡Cierra ventanas!'" },
    { id: 54, category: "tecnología", text: "'¿Por qué el WiFi rompió con el router?' 'Porque sentía que ya no había conexión.'" },
    { id: 55, category: "tecnología", text: "'¿Cómo se despiden los programadores?' '¡Hasta el próximo bug!'" },
    { id: 56, category: "tecnología", text: "'¿Por qué el smartphone fue a terapia?' 'Porque tenía problemas de conexión emocional.'" },
    { id: 57, category: "tecnología", text: "'¿Qué le dice un bit a otro?' 'Nos vemos en el bus de datos.'" },
    { id: 58, category: "tecnología", text: "'¿Por qué el programador confundió Halloween con Navidad?' 'Porque Oct 31 = Dec 25.'" },
    { id: 59, category: "tecnología", text: "'¿Cómo se llama el primo hacker de Bruce Lee?' 'Hack Lee.'" },
    { id: 60, category: "tecnología", text: "'¿Qué hace un ordenador cuando tiene hambre?' '¡Pide bytes!'" },
    { id: 61, category: "tecnología", text: "'¿Por qué no puedes discutir con un algoritmo?' 'Porque siempre tiene la última palabra.'" },
    { id: 62, category: "verde", text: "Esto es caperucita que va por el bosque y se encuentra con el lobo, y le dice: 'Caperucita, te voy a comer lo que nunca te han comido nunca', y dice caperucita: 'Pues como no sea la cesta...'"},
    { id: 63, category: "verde", text: "Dos amigos en un Bar: 'A mi lo que más me gusta de las mujeres son las piernas' 'Que curioso, ¡eso es lo primero que yo aparto!'"},
    { id: 64, category: "verde", text: "'Una mujer celosa le pregunta a su marido:' '¿Con cuántas mujeres has dormido?'' 'Él responde:' '¡Contigo nada más! Con las otras no me entra sueño.'"},
    { id: 65, category: "verde", text: "'Un gintonic, por favor.' '¿Le pongo pepino, caballero?' 'Desde el primer día que la vi, señorita...'"},
    { id: 66, category: "verde", text: "'¿Cuál es el mejor afrodisíaco?' 'El agua caliente,que abre las almejas y pone los huevos duros.'"},
    { id: 67, category: "verde", text: "'¿Hacemos Doritos?' '¿En el microondas?' 'Vaya Dora, nunca pillas la indirecta.'"},
    { id: 68, category: "verde", text: "Una madre a su hija: 'Hija mia... dicen las vecinas que te estás acostando con tu novio!' 'Mami, la gente es tan chismosa… Una se acuesta con uno cualquiera y ya les da por decir que es el novio.'"},
    { id: 69, category: "verde", text: "Un espermatozoide le pregunta a otro: 'Oye, ¿¿nos falta mucho para llegar al óvulo??' 'Es probable, ¡¡¡porque apenas vamos por la garganta!!!'"},
    { id: 70, category: "negro", text: "Mi esposa lleva desaparecida dos semanas. La policía dijo que debía prepararme para lo peor. Así que le dije a mi nueva novia que era mejor que se fuera de casa por si volvia..."},
    { id: 71, category: "negro", text: "¿Qué le regalas a un niño sin brazos por Navidad? Nada, no podría abrirlo de todos modos."},
    { id: 72, category: "verde", text: "'¿Soy guapa, cariño?' '¡Eres como el Sol! Duele mirarte'"},
    { id: 73, category: "negro", text: "'Mami, algo le pasa al conejito...' 'Niña, calla y vuelve a cerrar la puerta del horno.'"},
    { id: 74, category: "negro", text: "En la consulta del médico: 'Pues vamos a tener que mandar hacer una placa' '¿De tórax, Doctor?' 'No, de mármol'"},
    { id: 75, category: "negro", text: "Finalmente me compré una de esas bacas para el techo del coche. Son muy prácticas, ahora apenas oigo a mis hijos."},
    { id: 76, category: "negro", text: "¿Cómo llamas a un perro sin patas? En realidad no importa cómo lo llames, no va a venir de todos modos."},
    { id: 77, category: "verde", text: "'Una caja de condones, por favor' 'Son diez euros, ¿le pongo bolsa?' 'No hace falta, esta vez no es tan fea.'"},
    { id: 78, category: "general", text: "Papá, ¿ya tienes los resultados de la prueba de ADN? 'Llámame Antonio.'"},
    { id: 79, category: "negro", text: "¿Qué es peor que seis niños colgados de un árbol? Un niño colgado de seis árboles."},
    { id: 80, category: "verde", text: "'Cariño, antes de casarnos me prometiste tener, como mínimo, dos días de sexo a la semana.' 'Aham, sí. Así es… ¿y?' 'Que no lo estás cumpliendo.' 'Qué sabrás tú...'"},
    { id: 81, category: "verde", text: "Cariño ¿Te la puedo meter por la oreja? '¿Y si me quedo sorda?' '¿Te has quedado muda?'"},
    { id: 82, category: "verde", text: "'Oye, acabo de conocer a tu novia.' 'Ah, ¿si? ¿Dónde?' '¿Sabes la tienda que hay frente al club de swingers?' 'Si.' 'Pues enfrente.'"},
    { id: 83, category: "verde", text: "'Cariño, prepárate, porque voy a hacerte muy feliz.' '¿Ya te vas?'"},
    { id: 84, category: "general", text: "A usted no le pasa que se deja llevar… y cuando quiere reconducir la situación… ya es demasiado tarde? '… yo os declaro marido y mujer.'"},
    { id: 85, category: "verde", text: "¡Mamá, hay una corrida en la tele! 'Y qué quieres, ¿que la grabe?' 'No. Que la limpies.'"},
    { id: 86, category: "negro", text: "Cariño, díselo al niño con tacto… ¡por Dios, eh? ¡qué te conozco…! 'Qué sí, mujer… tranquila…! Hijo, ven un segundo que quiero hablar tranquilamente contigo… ¿te acuerdas el dibujo de la familia que hiciste ayer? Pues borra al perro.'"},
    { id: 87, category: "negro", text: "Doctor…¿Qué tal mi análisis? Me muero por saberlo… 'Mmmm… No, por saberlo no…'"},
    { id: 88, category: "negro", text: "El sentido del humor es como los padres… algunos lo tienen y otros no."},
    { id: 89, category: "negro", text: "Cariño, nunca pensé que nuestro hijo pudiera llegar tan lejos. 'Lo sé, querido. ¡Esta catapulta es la ostia!'"},
    { id: 90, category: "negro", text: "¿Qué le pasa a un hombre que se queda sin trabajo? 'Pues le pasa lo mismo que a una mujer que se queda sin marido.'"},
    { id: 91, category: "negro", text: "¿Donde se lavó el primer juguete sexual? 'En una pila bautismal.'"},
    { id: 92, category: "negro", text: "¿En qué se parecen una mujer a una ficha de las damas? 'En que las dos se corren con un dedo.'"},
    { id: 93, category: "negro", text: "Sabes que te has hecho mayor cuando tu juguete sexual favorito es un rodillo de amasar."},
    { id: 94, category: "negro", text: "Sabes que te has hecho mayor cuando el cura ya no te mira con deseo."},
    { id: 95, category: "negro", text: "Te aviso que mi chiste es tan negro que recoge algodón"},
    { id: 96, category: "general", text: "¿Qué hace un zombie en la playa? 'Nada, es un muerto viviente.'"},
    { id: 97, category: "negro", text: "¿En que se parecen un chiste negro y un niño con cancer? 'En que los dos nunca envejecen'"},
    { id: 98, category: "negro", text: "¿En que se parece la vida y una caja de dulces? 'En que la del gordo se acaba antes'"},
    { id: 99, category: "negro", text: "¿Papá, puedo seguir columpiando al abuelo? 'No, hijo, hasta que sepamos por que se ahorcó'"}
];
