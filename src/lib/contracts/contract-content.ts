/**
 * Texto íntegro de los documentos del contrato para LECTURA en pantalla.
 *
 * Se muestra como texto (no PDF) para que la lectura sea fiable en todos los
 * dispositivos y se pueda detectar de forma nativa cuándo el cliente ha llegado
 * al final. El PDF firmado que recibe el cliente se genera desde este mismo
 * texto (ver src/lib/contracts/pdf.ts).
 *
 * Fiel a: public/documentos/condiciones-alquiler.pdf y proteccion-datos.pdf
 * Sin dependencias de Node (se usa en el componente cliente).
 */

export type ContractBlock =
  | { type: "h"; text: string }
  | { type: "p"; text: string; highlight?: boolean }
  | { type: "li"; text: string; highlight?: boolean };

export interface ContractDocContent {
  title: string;
  blocks: ContractBlock[];
}

const CONDICIONES: ContractDocContent = {
  title: "Condiciones del alquiler",
  blocks: [
    {
      type: "p",
      text: "Desde el inicio de las gestiones para realizar la reserva de una furgoneta camper (autocaravana), las siguientes condiciones de alquiler son de aplicación y pasan a formar parte del contrato de arrendamiento del vehículo camper que se formalizará entre ambas partes: la empresa FURGOCASA CAMPERVANS, S.L., con NIF B-87947412, en adelante “empresa FURGOCASA” (arrendador) y usted, en adelante “cliente” (arrendatario).",
    },
    {
      type: "p",
      text: "Le rogamos lea con atención estas condiciones comerciales ya que son de ineludible aplicación.",
    },
    {
      type: "p",
      text: "Previo a la entrega del vehículo ambas partes suscribirán el contrato de arrendamiento del vehículo con arreglo a las condiciones especiales de la reserva vinculante válidamente realizada y conforme a las presentes condiciones generales de alquiler, que habrán de ser aceptadas expresamente por el cliente como parte integrante del contrato.",
    },
    {
      type: "p",
      text: "Asimismo, en el mencionado momento de la entrega, a fin de dar cumplimiento a las obligaciones legales impuestas en materia de protección de datos y con motivo de la existencia de dispositivos de geolocalización en todos nuestros vehículos, se firmará entre el arrendador y el arrendatario un “Anexo específico en materia de protección de datos; geolocalización de vehículos” el cual se especifica el tipo de información recabada y los posibles usos previstos, que, del igual manera, deberá ser aceptado de forma expresa en su totalidad por parte del cliente.",
    },
    {
      type: "p",
      text: "La no aceptación de las presentes condiciones generales o del referido anexo específico de protección de datos por parte del cliente se entenderá como una rescisión de la reserva, siendo de aplicación los apartados 4 y 5 del presente documento.",
    },

    { type: "h", text: "1. Ámbito de aplicación, contenido del contrato y derecho aplicable." },
    {
      type: "p",
      text: "1.1. Únicamente son válidas las siguientes Condiciones Comerciales Generales de FURGOCASA. No se admitirán aquellas condiciones del cliente que difieran o sean contrarias a las Condiciones Comerciales Generales de FURGOCASA.",
    },
    {
      type: "p",
      text: "1.2. El objeto del contrato formalizado con el cliente es, únicamente, la entrega en régimen de alquiler de la autocaravana y, en su caso, de los accesorios extras u opcionales ofrecidos por FURGOCASA y reservados por el cliente con anterioridad.",
    },
    {
      type: "p",
      text: "1.3. En virtud de este acuerdo FURGOCASA estará obligada a ofrecer al cliente el vehículo seleccionado (o uno de su misma categoría). En el caso de que el vehículo reservado no estuviese disponible por circunstancias de fuerza mayor, FURGOCASA se reserva el derecho a sustituir el vehículo por otro alternativo sin previo aviso. El vehículo alternativo será lo más similar posible al vehículo inicialmente reservado. FURGOCASA determinará razonablemente, si se deberá y en cuanto, indemnizar al cliente si la sustitución del vehículo se lleva a cabo. Por su parte, FURGOCASA se reserva el derecho a, en caso de que, por causas no imputables a ella misma o de que concurran circunstancias de fuerza mayor, no sea posible facilitar una alternativa válida de sustitución para el alquiler, suspender el acuerdo alcanzado y a cancelar la reserva, no teniendo, en este caso, más responsabilidad que devolver al cliente la cantidad íntegra que haya satisfecho.",
    },
    {
      type: "p",
      text: "1.4. Al momento de la entrega del vehículo se formalizará un contrato de alquiler entre el cliente y FURGOCASA regido exclusivamente por el derecho español, por las condiciones generales aquí recogidas y por las especiales que se pacte entre las partes. El cliente organizará él mismo su viaje y utilizará el vehículo bajo su propia responsabilidad. El contrato de alquiler estará limitado a la duración acordada por las partes. Queda excluida la prolongación tácita del contrato de alquiler por un período indeterminado debido a un uso continuado.",
    },
    {
      type: "p",
      text: "1.5. Todos los acuerdos entre FURGOCASA y el cliente se realizarán por escrito, ya sea por vía telemática, postal o presencial.",
    },

    { type: "h", text: "2. Edad mínima y conductores autorizados." },
    {
      type: "p",
      highlight: true,
      text: "2.1. El cliente y cada uno de los conductores deberán tener como mínimo de edad 25 años y estar en posesión del permiso de conducción clase B vigente, con mínimo tres años de antigüedad, o el permiso nacional equivalente a éste. En caso de no ser residente en la UE deberá estar en posesión del permiso de conducir internacional en vigor correspondiente a este tipo de vehículos.",
    },
    {
      type: "p",
      text: "2.2. En el caso de realizar una reserva de alquiler y, tras aportar la documentación, no acreditar el cumplimiento de los requisitos exigidos, el alquiler será cancelado debiendo el cliente sufragar una comisión de gestión del alquiler por importe de 40,00 euros (IVA incluido).",
    },
    {
      type: "p",
      text: "2.3. Si en el momento de la entrega de la autocaravana por parte de FURGOCASA, el cliente no dispone del permiso de conducir de al menos un conductor que se corresponda con el vehículo alquilado o la documentación presentada es falsa o inexacta, se considerará a todos los efectos que el cliente no ha acudido a recoger la autocaravana, por lo que se aplicarán las condiciones de rescisión de la reserva vinculante por parte del cliente que se contienen en el apartado 5.1. del presente documento, sin derecho a indemnización ni a devolución de ningún tipo.",
    },
    {
      type: "p",
      text: "2.4. Tan sólo podrán conducir el vehículo el cliente y los conductores que cumplan las condiciones previstas en el apartado 2.1 de este documento. Antes de la confirmación de la reserva por parte de FURGOCASA, el conductor titular está obligado a enviar copia en vigor de los siguientes documentos relativos a los conductores previstos:",
    },
    { type: "li", text: "a) Documento nacional de identidad (DNI), en su defecto pasaporte," },
    { type: "li", text: "b) Carnet de conducir europeo, en su defecto carnet de conducir internacional," },
    {
      type: "li",
      text: "c) En caso de ser cliente con carnet de conducir español, consulta de los puntos restantes del carnet realizada en la página web de la Dirección General de Tráfico.",
    },
    {
      type: "p",
      text: "En el momento de la recogida del vehículo será obligatorio presentar los originales de dicha documentación (a excepción de la consulta de puntos). Todos los conductores autorizados tendrán responsabilidad personal sobre cualquier infracción legal que sea incurrida durante el periodo del alquiler. El cliente autoriza expresamente a FURGOCASA a que informe a las autoridades de tráfico pertinentes sobre que conductor se estima que conducía en cada alquiler y a que las consecuencias económicas de cualquier infracción personal cometida durante el tiempo que dura el alquiler le sean cargadas en su tarjeta de crédito en los siguientes doce meses.",
    },

    { type: "h", text: "3. Precios y duración del alquiler." },
    {
      type: "p",
      text: "3.1. El precio del alquiler de la autocaravana y el período mínimo de alquiler durante las diferentes épocas del año, se derivan de la lista de precios vigente de FURGOCASA en el momento de realizar la reserva y que se encuentra reflejadas en la página web la empresa, sección de “Tarifas y condiciones”. En función de los días de alquiler reservados, serán válidos los precios que aparezcan en la lista para la temporada correspondiente. Los correspondientes precios de alquiler incluyen el IVA 21%.",
    },
    {
      type: "p",
      text: "3.2. Los precios diarios de alquiler se devengan en su integralidad por periodos de 24 horas, no siendo posible la reducción del precio por periodos inferiores ni prorrateo por horas.",
    },
    {
      type: "p",
      text: "3.3. Los precios de alquiler de los accesorios opcionales se derivan de la lista de precios de FURGOCASA vigente en el momento de formalizar la reserva y que el cliente declara conocer y aceptar expresamente.",
    },
    {
      type: "p",
      text: "3.4. El alquiler mínimo varía en función de la temporada. Así: 1) en temporada Baja y Media el alquiler mínimo es de tres (3) días; 2) en temporada Media Alta la duración mínima es de cinco (5) días; 3) en temporada Alta la duración mínima es de siete (7) días. En todos los casos, la duración máxima del alquiler es de sesenta (60) días.",
    },
    {
      type: "p",
      text: "3.5. El precio satisfecho por el alquiler incluyen, además del propio derecho a la utilización del vehículo durante el periodo pactado: la posibilidad de que conduzcan varios conductores, el kilometraje ilimitado, seguro a todo riesgo, según la correspondiente cobertura del seguro (véase más abajo apdo. 14), los diferentes accesorios y extras que FURGOCASA pone a disposición del vehículo sin coste adicional y asistencia en carretera en caso de avería a prestar en este caso por la compañía de seguros contratada por FURGOCASA.",
    },
    {
      type: "p",
      text: "3.6. El período de alquiler empieza con la recogida de la autocaravana por parte del cliente a la hora acordada en el punto de entrega acordado y finaliza con la entrega de la misma por parte del cliente a la hora acordada en el punto de devolución acordado. Por norma general los horarios que aparezcan en la factura del alquiler remitida al cliente por FURGOCASA se considerarán los acordados. El horario dentro del cual podrán acordarse las entregas y devoluciones será:",
    },
    {
      type: "li",
      text: "De octubre a abril, ambos incluidos, de lunes a domingo de 09:00 a 18:00 horas; no pudiendo, en ningún caso, alterarse dicho horario.",
    },
    {
      type: "li",
      text: "De mayo a septiembre, ambos incluidos, de lunes a domingo de 09:00 a 19:00 horas; no pudiendo, en ningún caso, alterarse dicho horario.",
    },
    {
      type: "p",
      text: "3.7. Se entenderá que se ha producido la entrega del vehículo por parte del cliente con la entrega final de las llaves por parte de éste al personal de FURGOCASA. En ningún caso, se considerará como hora de entrega la hora de llegada del cliente al parking de FURGOCASA; y, mucho menos, cuando el cliente aun necesite realizar tareas de limpieza o vaciado de depósitos en el vehículo con anterioridad a la devolución (en este último caso, se aplicarán las penalizaciones por retraso recogidas en la cláusula 3.8. del presente contrato).",
    },
    {
      type: "p",
      highlight: true,
      text: "3.8. En caso de retrasos, tanto en la cita de entrega (inicio del alquiler), como en la cita de devolución (fin del alquiler), el cliente abonará a FURGOCASA la cantidad de 40 euros (IVA incluido) por la primera hora y de 20 euros (IVA incluido) por cada hora de retraso extra. No obstante, como máximo, por cada día de retraso el precio será el equivalente a dos días de alquiler.",
    },
    {
      type: "p",
      text: "IMPORTANTE: recomendamos, en el caso de que por la circunstancia que sea, el cliente prevea llegar con retraso a cualquiera de las citas, que, cuanto antes, se ponga en contacto con FURGOCASA con el fin de ampliar su alquiler el tiempo necesario pagando la tarifa diaria normal, lo que supondría un coste inferior al de la penalización referida en el párrafo anterior.",
    },
    {
      type: "p",
      text: "3.9. Cualquier causa justificada de fuerza mayor que impida la devolución en el día acordado, deberá ser comunicada inmediatamente a FURGOCASA para que sea aceptada; en caso contrario se considerará retraso no autorizado.",
    },
    {
      type: "p",
      text: "3.10. El cliente, salvo causa de fuerza mayor debidamente justificada y comunicada a FURGOCASA lo antes posible, asumirá todos los gastos ocasionados por un retraso en la entrega del vehículo y, en especial, aquellos gastos derivados de la circunstancia de que otro cliente u otra persona haga valer sus derechos frente a FURGOCASA como consecuencia del citado retraso.",
    },
    {
      type: "p",
      text: "3.11. Las devoluciones deberán realizarse siempre en la hora acordada, que en todo caso deberá encontrarse dentro del horario de entrega y devolución fijado por FURGOCASA. En ningún caso se podrá acordar ni realizar una devolución fuera del horario fijado. En caso de que, por retraso en relación con la hora de devolución acordada, el cliente exceda el horario de devolución previsto, la devolución deberá realizarse en la siguiente franja horaria de apertura, aplicándose en su caso las penalizaciones por retraso que correspondan en función del apartado 3.8 anterior.",
    },
    {
      type: "p",
      text: "3.12. En caso de devolver el vehículo antes de que transcurra el período de alquiler contratado, se deberá igualmente pagar el precio íntegro de alquiler acordado contractualmente, sin que venga obligada FURGOCASA a devolver al cliente cantidad alguna.",
    },
    {
      type: "p",
      text: "3.13. Si el cliente desea prolongar el arrendamiento, deberá solicitarlo a FURGOCASA cuanto antes. La eventual confirmación de la prórroga estará sujeta a las disponibilidades que en este momento tenga FURGOCASA, no asumiendo por tanto esté último ningún compromiso previo alguno.",
    },
    {
      type: "p",
      text: "3.14. Cualquier alteración de las fechas de alquiler deberá ser previamente autorizada por FURGOCASA. El incumplimiento de esta condición faculta a FURGOCASA para hacerse cargo del vehículo o requerirlo judicialmente.",
    },

    { type: "h", text: "4. Reserva y pago del alquiler. Derecho a desistir." },
    {
      type: "p",
      text: "4.1. Para realizar la reserva el cliente deberá abonar el coste total del alquiler (incluidos costes de gestión y transporte).",
    },
    {
      type: "p",
      text: "4.2. Una vez se reciba notificación de la realización del pago, FURGOCASA confirmará por correo electrónico al cliente la formalización de la reserva, siendo ésta, a partir de este momento, vinculante para ambas partes. En caso de que no se reciba el pago, se entenderá que no se ha realizado reserva alguna por parte del cliente, resultando en este caso FURGOCASA eximida de cualquier responsabilidad.",
    },
    {
      type: "p",
      text: "4.3. Tras la formalización de la reserva, FURGOCASA enviará al cliente copia del presente contrato, con las condiciones generales del alquiler, y copia del “Anexo específico en materia de protección de datos; geolocalización de vehículos”. Estos documentos deberán ser leídos con detalle por parte del cliente con el fin de que todo su contenido este claro y pueda ser aceptado expresamente, con la firma, el día de la entrega del vehículo.",
    },
    {
      type: "p",
      text: "4.4. El cliente dispondrá de 14 días naturales para leer el presente contrato y, en caso de no estar conforme con el contenido de este, informar a FURGOCASA de su oposición y de su voluntad de rescindir, en este caso sin penalización alguna, el alquiler. El plazo de desistimiento expirará a los 14 días naturales del envío de la factura y contrato por parte de FURGOCASA. En los casos en los que, entre el momento de formalización de la reserva y el comienzo del alquiler, diste menos de los referidos 14 días, el derecho para desistir vencerá, como tarde 7 días antes del inicio del viaje. Si la reserva se realiza con menos margen, es decir, si entre el momento de realización de la reserva y el comienzo del viaje distan menos de 7 días, no podrá ejercitarse este derecho.",
    },
    {
      type: "p",
      text: "4.5. ESTE DERECHO DE DESISTIMIENTO SOLO SERÁ APLICABLE PARA RESERVAS DE CLIENTES HECHAS A TRAVÉS DE NUESTRA WEB: www.furgocasa.com. EN CASO DE RESERVAS REALIZADAS A TRAVÉS DE OTROS PORTALES O MARKETPLACES APLICARÁN LAS POLÍTICAS DE CANCELACIÓN DE LOS PROVEEDORES DE SERVICIOS DE INTERMEDIACIÓN; POLÍTICAS ESTAS ÚLTIMAS SOBRE LAS QUE FURGOCASA NO PUEDE INFLUIR.",
    },

    { type: "h", text: "5. Cancelación de la reserva y modificación de las fechas del alquiler" },
    {
      type: "p",
      text: "5.1. Transcurrido el periodo de desistimiento, en caso de que el cliente decida cancelar la reserva se aplicarán las siguientes penalizaciones:",
    },
    {
      type: "li",
      text: "hasta 16 días antes del comienzo del alquiler, 10% del precio total del alquiler. El cliente podrá contratar, en el momento de realización de la reserva, un servicio de cancelación, por 5 euros al día, que limitará el coste de cancelación de este periodo a dicho precio. Esta cobertura no aplicará sobre las penalizaciones recogidas a continuación; es decir, cuando resten menos de 16 días hasta el comienzo del alquiler.",
    },
    { type: "li", text: "entre 15 y 8 días antes del inicio del alquiler, 50% del precio total del alquiler." },
    { type: "li", text: "menos de 7 días antes del inicio del alquiler, 75% del precio total del alquiler." },
    {
      type: "p",
      text: "5.2. Es posible cambiar la fecha de un alquiler sin coste una única vez. Para que sea posible gestionar dicho cambio, hay que avisar del mismo, como mínimo, con 15 días de antelación a la fecha de comienzo del alquiler. Asimismo, hay que informar de la nueva fecha elegida en el momento del cambio y esta tiene que estar dentro de los 12 meses siguientes contando desde el primer día del alquiler original. Este cambio está sujeto a disponibilidad. En caso de un segundo cambio, que igualmente deberá respetar los plazos señalados, se devengarán unos gastos de gestión de 50 euros (IVA incluido).",
    },
    {
      type: "p",
      text: "5.3. ESTA POLÍTICA DE CANCELACIÓN SOLO SERÁ APLICABLE PARA RESERVAS DE CLIENTES HECHAS A TRAVÉS DE NUESTRA WEB: www.furgocasa.com. EN CASO DE RESERVAS REALIZADAS A TRAVÉS DE OTROS PORTALES O MARKETPLACES APLICARÁN LAS POLÍTICAS DE CANCELACIÓN DE LOS PROVEEDORES DE SERVICIOS DE INTERMEDIACIÓN; POLÍTICAS ESTAS ÚLTIMAS SOBRE LAS QUE FURGOCASA NO PUEDE INFLUIR.",
    },

    { type: "h", text: "6. Pagos adicionales al precio del alquiler" },
    {
      type: "p",
      text: "6.1. El cliente se compromete expresamente a pagar, además del precio del alquiler, a FURGOCASA:",
    },
    {
      type: "li",
      text: "a) Los cargos adicionales que se originen si el vehículo es dejado en algún otro sitio o ciudad, sin la autorización del arrendador.",
    },
    {
      type: "li",
      text: "b) El importe de toda clase de sanciones, multas, penas, gastos judiciales y extrajudiciales derivados de cualquier infracción de tráfico, ya sea administrativa, penal o de cualquier otra clase, que sean dirigidas contra el vehículo, el cliente o empresa FURGOCASA, derivados del tiempo de vigencia de este contrato de alquiler, a no ser que se hayan originado por culpa de FURGOCASA.",
    },
    {
      type: "li",
      text: "c) En el supuesto de que por culpa del cliente fuese el vehículo retenido, paralizado, precintado, depositado o embargado, o de cualquier manera inmovilizado por cualquier causa, todos los gastos serán a su cargo, incluido el lucro cesante de la empresa arrendadora durante el tiempo que dure la inmovilización del vehículo.",
    },
    {
      type: "li",
      text: "d) Gastos incurridos por FURGOCASA (incluidos honorarios de Abogados y Procuradores, aunque su intervención no sea preceptiva) en la reclamación de las cantidades adeudadas por el cliente en virtud del presente contrato.",
    },
    {
      type: "li",
      highlight: true,
      text: "e) El vehículo dispone de un seguro a todo riesgo con franquicia de 900 € por cada siniestro (no incluye los efectos personales del cliente y acompañantes). En caso de siniestro cuyo coste de reparación exceda el coste de la franquicia, el cliente se hará cargo del importe de 900 €.",
    },
    {
      type: "li",
      text: "f) Todos aquellos daños causados a un tercero o a FURGOCASA no cubiertos por el seguro del vehículo y que sean evaluables económicamente en ese momento.",
    },
    {
      type: "li",
      text: "g) Los gastos de limpieza, derivados de cualquier incumplimiento. Asimismo, el cliente deberá asumir los gastos derivados de la ventilación o la eliminación del olor a tabaco, incluyendo las pérdidas generadas por la imposibilidad de alquilar el vehículo durante algún tiempo debido a este motivo.",
    },

    { type: "h", text: "7. Condiciones del pago" },
    { type: "p", text: "7.1. Solo se aceptan pagos con tarjeta de crédito o transferencia bancaria." },
    { type: "p", text: "7.2. Todos los pagos que hagan los clientes, así como las devoluciones, se harán en EUROS (€)." },
    {
      type: "p",
      text: "7.3. Si el cliente se retrasa en los pagos, se aplicarán intereses por demora de conformidad con las disposiciones legales vigentes.",
    },

    { type: "h", text: "8. Fianza y gestión de daños." },
    {
      type: "p",
      highlight: true,
      text: "8.1. Antes de que le sea confirmada la cita del alquiler, con un máximo de 72 horas (3 días) antes del inicio del alquiler, el cliente deberá abonar la cantidad de MIL EUROS (1.000 €), por transferencia bancaria, escribiendo únicamente el nombre completo asociado a la reserva en el concepto, a la cuenta del Banco Sabadell número IBAN ES3000810210150002342846, titularidad de FURGOCASA CAMPERVANS, en concepto de fianza y como garantía del fiel cumplimiento de las obligaciones del contrato de arrendamiento. El cliente deberá asimismo enviar por email a reservas@furgocasa.com el justificante de la transferencia y un certificado de titularidad bancaria de la cuenta desde la que se hace dicha transferencia, debiendo el titular de la misma coincidir con el nombre que conste en el documento oficial de identificación (DNI o Pasaporte) del cliente cuyos datos se utilizaron para realizar la reserva.",
    },
    {
      type: "p",
      text: "8.2. La fianza será utilizada para cubrir el coste de cualquier pérdida o daño del equipamiento, complementos, extras, reparaciones o daño negligente en el vehículo y, en caso de existir motivo, los pagos adicionales al precio del alquiler previstos en la cláusula 6.1 del presente contrato.",
    },
    {
      type: "p",
      text: "8.3. En el momento de la recogida, el cliente deberá cumplimentar y firmar una hoja “estado de entrega del vehículo” que reflejará todos y cada uno de los desperfectos o daños, tanto interiores como exteriores, existentes en el vehículo previos al momento de comienzo del alquiler, así como los kilómetros y el estado de los depósitos de gasolina y de aguas.",
    },
    {
      type: "p",
      text: "8.4. Si bien FURGOCASA hará lo posible en asistir al cliente y, siempre que sea conocedora, informará de cualquier desperfecto o falta de accesorios durante el proceso de cumplimentación de la documentación anterior, el cliente asume que es su única y exclusiva responsabilidad el cerciorarse de realizar una revisión minuciosa del vehículo y de asegurarse que la información recogida en las hojas es la correcta.",
    },
    {
      type: "p",
      text: "8.5. La devolución de la fianza se tramitará durante los diez (10) días laborales siguientes a la devolución del vehículo. En caso de no ser posible, por causas no imputables a FURGOCASA, la valoración de los daños de forma inmediata, FURGOCASA dispondrá de cuarenta y cinco (45) días para efectuar la liquidación y devolver la fianza si procede o reclamar la diferencia entre ésta y el coste de los desperfectos. Durante dicho periodo FURGOCASA tendrá el derecho a examinar el vehículo, y realizar tantas pruebas y revisiones estime pertinentes, a fin de detectar posibles daños o desperfectos ocasionados por el cliente en incumplimiento de sus obligaciones durante el alquiler.",
    },
    {
      type: "p",
      text: "8.6. En el caso de detectarse daños que no se encuentre reflejados en la hoja “estado de entrega del vehículo”, FURGOCASA dictaminará, en base a los presupuestos recibidos, el coste que el cliente deberá a abonar e informará a este de dicha circunstancia. En la devolución del vehículo por finalización del alquiler, el cliente acepta previamente la valoración de los daños resultantes de la inspección realizada por el personal de FURGOCASA, que se basará en los presupuestos recibidos por parte de los proveedores en cada caso.",
    },
    {
      type: "p",
      text: "8.7. En caso de un siniestro cuyo coste de reparación exceda la franquicia del seguro, se deducirá de la fianza el importe de la franquicia del seguro a todo riesgo.",
    },
    {
      type: "p",
      text: "8.8. En cualquier caso, adicionalmente, bien si existe un daño reparable sin necesidad de activar la cobertura del seguro o bien si se produce un siniestro a cubrir con la franquicia, se añadirá una comisión de gestión de reparaciones a determinar, en cada caso, en función del esfuerzo a realizar y coste a incurrir por FURGOCASA y que, en ningún caso, podrá superar los 95,00 euros (IVA incluido).",
    },
    {
      type: "p",
      text: "8.9. En el caso de detectarse la perdida de alguno de los accesorios listados en la hoja “inventario y precio de accesorios” el cliente vendrá obligado a sufragar el precio previamente recogido en dicho documento en relación a dicho artículo.",
    },
    {
      type: "p",
      text: "8.10. Estos importes serán deducidos de la fianza depositada, aceptando el cliente el pago de la diferencia si el coste de los desperfectos y/o perdidas supera el montante de la misma.",
    },

    { type: "h", text: "9. Entrega y devolución del vehículo." },
    {
      type: "p",
      text: "9.1. Antes de iniciar el viaje, el cliente está obligado a seguir las instrucciones de manejo que le dé el personal técnico de FURGOCASA en el punto de entrega. FURGOCASA se podrá negar a entregar el vehículo hasta que no se haya realizado la instrucción de manejo del vehículo.",
    },
    {
      type: "p",
      highlight: true,
      text: "9.2. La autocaravana se entrega con una determinada cantidad de combustible (Diesel y/o Adblue) y debe devolverse en las mismas condiciones (hoja de entrega). En caso contrario, FURGOCASA cobrará al cliente la cantidad de combustible que falte hasta alcanzar la cantidad con la que fue entregada con un recargo del 100% sobre el precio satisfecho por FURGOCASA; es decir, el precio de la gasolina que falte multiplicado por dos.",
    },
    {
      type: "p",
      highlight: true,
      text: "9.3. El vehículo se devolverá limpio interiormente (la limpieza exterior no es necesaria) y con los depósitos de aguas residuales y del WC vacíos. En caso contrario, se devengará un suplemento de:",
    },
    { type: "li", highlight: true, text: "20 euros (IVA incluido) en relación al vaciado del depósito de aguas grises." },
    { type: "li", highlight: true, text: "Desde 120 euros (IVA incluido) en relación a la limpieza del habitáculo del vehículo." },
    { type: "li", highlight: true, text: "70 euros (IVA incluido) en relación al vaciado del WC químico (aguas negras)." },

    { type: "h", text: "10. Usos prohibidos, obligaciones de mantenimiento y protección." },
    {
      type: "p",
      text: "10.1. El vehículo se debe cuidar y tratar adecuadamente, así como cerrar debidamente. Se deberán tener en cuenta las normas técnicas, así como las disposiciones determinantes para el uso. Se deberá controlar el estado del vehículo en cada repostaje de combustible, sobre todo el nivel de agua y aceite, así como la presión de los neumáticos. El cliente se compromete a comprobar regularmente si la autocaravana de alquiler está en perfectas condiciones para circular con seguridad. Si resultase dañado el vehículo como consecuencia de un sobrecalentamiento debido a niveles bajos de aceite o refrigerante del motor, el cliente será responsable del daño ocasionado en el vehículo y deberá correr con los gastos de reparación.",
    },
    {
      type: "p",
      text: "10.2. El cliente reconoce que recibe el vehículo en perfectas condiciones mecánicas, con todas las revisiones, provisto de la documentación necesaria y con las herramientas, neumáticos y accesorios adecuados y se compromete a conservarlo en buen estado.",
    },
    {
      type: "p",
      text: "10.3. El cliente se compromete a respetar en todo momento las obligaciones y limitaciones descritas en el vigente Código de Circulación y, en particular y de forma expresa, se obliga a:",
    },
    { type: "li", text: "a) No permitir que lo conduzcan otras personas más que él mismo o las que expresamente estén autorizadas." },
    { type: "li", text: "b) No llevar más pasajeros que los especificados en la documentación del vehículo (máx. 4 pers.)," },
    {
      type: "li",
      text: "c) No transportar en la camper ningún tipo de mascota o animal sin la autorización expresa de FURGOCASA. En caso de ser autorizado el cliente a transportar mascota o animal deberá devolver el vehículo libre de pelos y olores.",
    },
    { type: "li", text: "d) No realquilar o transportar personas con fines comerciales y cualquier otro uso que no esté incluido en el contrato." },
    {
      type: "li",
      text: "e) No transportar cualquier tipo de mercancía, drogas, productos tóxicos, inflamables o explosivos ni encender o utilizar velas en el interior del vehículo.",
    },
    { type: "li", text: "f) No ceder su uso a terceros a título gratuito o lucrativo y no auxiliar a delincuentes." },
    { type: "li", text: "g) No cometer delitos, aunque estos solo sean castigados según la legislación vigente en el lugar de los hechos." },
    {
      type: "li",
      text: "h) No conducir el vehículo en inferioridad de condiciones físicas motivadas por alcohol, drogas, fatiga o enfermedad, uso de medicamentos, etc.",
    },
    {
      type: "li",
      text: "i) No transitar fuera de la red viaria o en cualquier terreno no adecuado, ni participar con el vehículo en pruebas deportivas, de resistencia, carreras u otras que puedan dañarlo.",
    },
    { type: "li", text: "j) No utilizarlo para empujar o remolcar otros vehículos o remolques." },
    { type: "li", text: "k) No desprecintar o manipular el cuentakilómetros, debiendo comunicar inmediatamente a FURGOCASA cualquier avería del mismo." },
    { type: "li", text: "l) No viajar, al quedar expresamente prohibido, a cualquier país que se encuentre en guerra o conflictos bélicos." },
    {
      type: "li",
      text: "m) Tener el vehículo adecuadamente estacionado y custodiado, cuando no lo utilice, y protegerlo del deterioro de las heladas, pedrisco o cualquier otro fenómeno atmosférico susceptible de producirle daños de importancia.",
    },
    {
      type: "p",
      text: "IMPORTANTE: Advertir, en relación con estas prohibiciones de uso, que todos los vehículos de FURGOCASA tienen instalados un dispositivo de geolocalización que permite la verificación del cumplimiento de algunos de los apartados previos.",
    },
    {
      type: "p",
      text: "10.4. El hecho de llenar el depósito de agua potable con Diesel u otro combustible, o el depósito de Diesel con agua u otro combustible (incluso BIODIESEL), implicará una penalización equivalente al coste incurrido por FURGOCASA en subsanar dicho rellenado indebido.",
    },
    {
      type: "p",
      text: "10.5. En caso de pérdida de las llaves o de la documentación del vehículo, FURGOCASA cargará al cliente la cantidad equivalente al coste incurrido en obtener una nueva copia de lo extraviado.",
    },
    {
      type: "p",
      text: "10.6. Queda expresamente prohibido al cliente variar cualquier característica técnica del vehículo, las llaves, cerraduras, equipamiento, herramientas y/o accesorios del vehículo, así como efectuar cualquier modificación de su aspecto exterior y/o interior, salvo expresa autorización escrita por parte de FURGOCASA. En caso de infracción de este artículo, el arrendatario correrá con todos los gastos de reacondicionamiento del vehículo a su estado original, debiendo abonar así mismo una indemnización por la inmovilización del vehículo hasta su total reparación.",
    },
    {
      type: "p",
      highlight: true,
      text: "10.7. Está prohibido fumar en todos los vehículos, así como encender velas en su interior. El incumplimiento de esta norma conllevará el cargo por parte de FURGOCASA de la cantidad de 200 euros (IVA incluido) en concepto de penalización.",
    },
    {
      type: "p",
      text: "10.8. En caso de comprobar que se han infringido las disposiciones de este contrato, FURGOCASA se reserva el derecho rescindir de inmediato el contrato de alquiler y solicitar la devolución del vehículo, quedando obligado, en tal caso, el cliente a devolver el vehículo a la mayor brevedad posible y a abonar la totalidad del precio del arrendamiento, así como los gastos por incumplimiento que en los citados apartados se relacionan.",
    },

    { type: "h", text: "11. Comportamiento a seguir en caso de accidente." },
    {
      type: "p",
      text: "11.1. En caso de accidente, robo, incendio o daños causados por animales de caza, el cliente deberá informar inmediatamente a FURGOCASA llamando al número de teléfono de atención al cliente (678.081.261). Fuera del horario de atención al público (ver página web www.furgocasa.com) o en festivo, deberá comunicar con la empresa en el horario o día de apertura inmediatamente posterior a producirse el percance. El cliente vendrá obligado a abonar todos los daños o perjuicios que provoquen la falta o el retraso en la comunicación a FURGOCASA de cualquiera de estas eventualidades.",
    },
    {
      type: "p",
      text: "11.2. Nunca se reconocerá o prejuzgará la responsabilidad del hecho, salvo la “Declaración Amistosa de Accidentes”. El cliente deberá obtener todos los datos de la parte contraria y de los testigos, que, junto con los detalles del accidente, remitirá en el plazo indicado FURGOCASA. El parte de accidente se deberá entregar debidamente cumplimentado y firmado como muy tarde en el momento de devolver el vehículo a FURGOCASA. El documento deberá incluir el nombre, la dirección y teléfonos de las personas implicadas, sus datos del carné de conducir, los datos del contrario con el nombre de la Compañía Aseguradora y el número de póliza, los datos de los eventuales testigos, así como las matrículas de los vehículos afectados.",
    },
    {
      type: "p",
      text: "11.3. En caso de robo o hurto del vehículo, se denunciará a la autoridad competente inmediatamente, comunicándolo y remitiendo copia de la denuncia a FURGOCASA, junto con las llaves del vehículo, en un plazo máximo de 24 horas; quedando, en caso contrario, sin efecto los seguros y coberturas contratadas.",
    },
    {
      type: "p",
      text: "11.4. En el supuesto de haberse ocasionado daños sin contrario, independientemente de su gravedad, el cliente deberá redactar para el arrendador un amplio informe por escrito junto con un boceto. Si el cliente no elabora el informe – no importa cuál sea la razón – e impide de este modo que la compañía de seguros pague los daños, el cliente estará obligado a abonar el importe correspondiente a la reparación a realizar en su totalidad.",
    },
    {
      type: "p",
      text: "11.5. No abandonar el vehículo sin tomar las adecuadas medidas para protegerlo y salvaguardarlo. Contactar en caso de ser necesario con la Compañía de Asistencia en Carretera contratada con la Aseguradora de FURGOCASA.",
    },
    {
      type: "p",
      text: "11.6. En caso de incumplimiento por el cliente de alguna de estas medidas, si son de aplicación, FURGOCASA podrá reclamar al cliente los daños y perjuicios ocasionados por negligencia de este, incluido el potencial lucro cesante de FURGOCASA durante el tiempo que dure la inmovilización del vehículo.",
    },

    { type: "h", text: "12. Defectos de la autocaravana." },
    {
      type: "p",
      text: "12.1. Quedan excluidos los derechos a indemnización por daños y perjuicios del cliente por defectos no imputables a FURGOCASA.",
    },
    {
      type: "p",
      text: "12.2. Al devolver el vehículo, el cliente deberá indicar por escrito a FURGOCASA los defectos que haya detectado en la autocaravana o su equipamiento una vez iniciado el período de alquiler, así como aquellos que se hayan generado durante la duración del mismo. Quedan excluidos los derechos a indemnización por daños y perjuicios en caso de defectos indicados con posterioridad, a no ser que dicha pretensión esté motivada por un daño no evidente.",
    },

    { type: "h", text: "13. Reparaciones y vehículo de cambio o sustitución." },
    {
      type: "p",
      text: "13.1. El cliente vendrá obligado a detener el vehículo lo antes posible cuando se ilumine cualquier testigo que indique anomalía en el funcionamiento del mismo, debiendo contactar con FURGOCASA o con la Compañía de Asistencia concertada por FURGOCASA y debiendo dirigirse exclusivamente a un servicio oficial de la marca del chasis-motor, salvo autorización expresa de FURGOCASA.",
    },
    {
      type: "p",
      text: "13.2. El cliente podrá encargar aquellas reparaciones que sean necesarias para garantizar la seguridad durante el funcionamiento y la circulación del vehículo en el período de alquiler, previa consulta y autorización de FURGOCASA, debiendo esta última reembolsarle la cantidad abonada en su totalidad. Para ello, tan sólo será necesario contar con la aprobación de FURGOCASA. Éste último asumirá los gastos de la reparación si se le hace entrega de las facturas originales y de las piezas cambiadas y siempre que el cliente no responda del daño. Quedan excluidos los daños que afecten a los neumáticos, las llantas, lunas y cristales del vehículo ocurridos durante el plazo de duración del arrendamiento, que serán siempre y en cualquier caso de cuenta del cliente. Igualmente, cualquier avería y las reparaciones debidas a defectos del suelo, pavimento o asfaltado son responsabilidad del cliente.",
    },
    {
      type: "p",
      text: "13.3. En caso de que una reparación de estas características sea necesaria y el cliente no se encargue de solucionarlo, éste último deberá indicar sin demora a FURGOCASA el desperfecto en cuestión y conceder un plazo razonable para su reparación. FURGOCASA no se responsabilizará de las condiciones específicas de cada país (p. ej. infraestructura), que conlleven una demora a la hora de realizar la reparación.",
    },
    {
      type: "p",
      text: "13.4. En el caso de cualquier avería del vehículo o de los elementos del habitáculo, el cliente deberá comunicarlo inmediatamente a FURGOCASA de quien recibirá las instrucciones oportunas para su reparación.",
    },
    {
      type: "p",
      text: "13.5. En caso de que siendo culpable el cliente, la autocaravana sufra graves daños o se prevea que el vehículo no se podrá utilizar durante un largo período de tiempo o se deba retirar de la circulación, FURGOCASA podrá negarse a ofrecer un vehículo de sustitución. En este caso queda excluida una rescisión del contrato por parte del cliente, quien vendrá obligado a abonar la totalidad del precio del arrendamiento, además de los gastos que su actuación hubiera producido. Si FURGOCASA optara por poner a disposición del cliente un vehículo de sustitución, podrá cobrarle al cliente los eventuales gastos derivados de ello.",
    },

    { type: "h", text: "14. Responsabilidad del arrendatario, seguro a todo riesgo." },
    {
      type: "p",
      highlight: true,
      text: "14.1. Según los principios del seguro a todo riesgo, en caso de producirse un siniestro con daños cuyo coste de reparación sea superior a la franquicia, FURGOCASA eximirá al cliente de la responsabilidad de los daños materiales sufridos en el vehículo con el abono de una franquicia de NOVECIENTOS EUROS (900 €), más el correspondiente IVA, que deberá asumir el cliente.",
    },
    {
      type: "p",
      text: "14.2. El cliente, bajo ningún concepto, quedará eximido de sus responsabilidades civiles, administrativas, penales o de cualquier índole que sean consecuencia de un siniestro o comportamiento doloso o culposo.",
    },
    {
      type: "p",
      text: "14.3. La eximente de la responsabilidad indicada en el apartado 11.1, no tendrá efecto si el cliente omite alguna de las normas indicadas en todos los puntos de las cláusulas 7 y 8.",
    },
    {
      type: "p",
      text: "14.4. Asimismo, la exención de responsabilidad del apdo. 11.1 no procederá en caso de que el cliente haya causado un daño de forma premeditada o negligente.",
    },
    { type: "p", text: "14.5. El cliente deberá responder en caso de comportamiento doloso o culposo en los siguientes casos:" },
    { type: "li", text: "a) Si el cliente no respeta las normas y el código de circulación vigente, del país donde esté circulando." },
    { type: "li", text: "b) Si los daños se deben a una conducción temeraria por los efectos de las drogas o el alcohol." },
    { type: "li", text: "c) Si el cliente o el conductor, a quien FURGOCASA le ha dejado el vehículo, huye en caso de accidente." },
    { type: "li", text: "d) Si los daños se deben a un uso prohibido en el apdo. 8.1." },
    { type: "li", text: "e) Si los daños se deben a una infracción de la obligación establecida en el apdo. 8.2." },
    { type: "li", text: "f) Si los daños los ha causado un conductor no autorizado, a quien el cliente haya dejado el vehículo." },
    { type: "li", text: "g) Si los daños se han provocado por no tener en cuenta las dimensiones del vehículo (altura, ancho, largo)." },
    { type: "li", text: "h) Si los daños se deben a un incumplimiento de las disposiciones relativas a la carga adicional." },
    {
      type: "p",
      text: "14.6. El cliente responderá de todos los gastos, tasas, multas y sanciones relacionadas con el uso del vehículo, que se le reclamen a FURGOCASA relativas al periodo de vigencia del alquiler, excepto si se debe a causas imputables a ésta última.",
    },
    {
      type: "p",
      text: "14.7. En caso de ser varios los clientes y/o conductores identificados, todos estos responderán en calidad de deudores solidarios.",
    },

    { type: "h", text: "15. Responsabilidad del arrendador." },
    {
      type: "p",
      text: "15.1. FURGOCASA entrega el vehículo en perfecto estado, habiendo realizado todas las verificaciones y labores de mantenimiento necesarias para su buen funcionamiento. En consecuencia, FURGOCASA no será responsable de fallos mecánicos o averías debido al uso normal del mismo que puedan producirse durante el periodo del alquiler, ni es responsable frente al cliente o los usuarios del vehículo de los gastos o perjuicios que se le puedan producir directa o indirectamente como consecuencia de tales fallos o averías.",
    },
    {
      type: "p",
      text: "15.2. Si por causa de fuerza mayor, motivos fortuitos o ajenos a FURGOCASA, no se pudiera entregar el vehículo en la fecha convenida, esto no dará derecho a ninguna indemnización a favor del cliente, salvo la devolución por parte de FURGOCASA al cliente de la cantidad/es pagada/s hasta esa fecha en concepto de alquiler.",
    },
    {
      type: "p",
      text: "15.3. FURGOCASA sólo responderá de forma limitada a los daños previsibles establecidos en el contrato, en la medida que se infrinja una obligación cuyo cumplimiento sea de especial importancia para alcanzar el objeto del contrato.",
    },
    {
      type: "p",
      text: "15.4. Las presentes “Términos y Condiciones Generales de Alquiler” vinculan a las partes desde el momento inicial de hacer la reserva y son parte integrante del contrato de arrendamiento de vehículos.",
    },

    { type: "h", text: "16. Protección de datos de carácter personal." },
    {
      type: "p",
      text: "A los efectos de lo dispuesto en la normativa vigente relativa a la protección de datos de carácter personal, FURGOCASA CAMPERVANS, S.L. le informa de que sus datos personales, tanto los proporcionados para la formalización del contrato como los recabados durante la vigencia de los servicios de alquiler, van a ser incorporados a un fichero de datos de carácter personal, debidamente inscrito en el Registro de la Agencia Española de protección de Datos, creado y bajo la responsabilidad de esta empresa, con domicilio en Francisco Silvela, 11, Madrid, con el fin de poder gestionar los servicios de alquiler de vehículos contratados, así como para fines comerciales tales como mantenerle puntualmente informado de todas aquellas ofertas, productos y promociones que puedan ser de su interés, bien por correo electrónico u otro modo equivalente.",
    },
    {
      type: "p",
      text: "En el caso de comunicaciones comerciales a través de correo electrónico o medio equivalente y de conformidad con lo establecido en la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico, usted otorga su consentimiento expreso para el envío de publicidad a través de dicho medio. Dicho consentimiento podrá ser revocado en cualquier momento mediante petición dirigida a la siguiente dirección: info@furgocasa.com",
    },
    {
      type: "p",
      text: "FURGOCASA le informa de que todos sus vehículos llevan instalado un dispositivo conectado a internet que nos permite recibir cierta información de los mismos, incluyendo datos de geolocalización procedentes de un sistema de posicionamiento global (GPS). Su información personal recabada a través de estos dispositivos se tratará de acuerdo con lo establecido en el presente Aviso y en el “Anexo específico en materia de protección de datos; geolocalización de vehículos” que fuera enviado y que deberá firmar junto con el presente contrato.",
    },
    {
      type: "p",
      text: "Adicionalmente, FURGOCASA CAMPERVANS, S.L. le informa de que, en caso de que se produzca cualquier tipo de impago con motivo de los servicios de alquiler contratados por Vd., y previo requerimiento de pago por parte de FURGOCASA, los datos relativos a dicho impago podrán ser comunicados a ficheros de información sobre solvencia patrimonial y crédito, de conformidad con lo previsto en la normativa vigente en protección de datos.",
    },
    {
      type: "p",
      text: "Puede ejercitar los derechos de acceso, rectificación, oposición y cancelación mediante petición escrita al Dpto. de Atención al Cliente o a la dirección de correo electrónico arriba indicada.",
    },

    { type: "h", text: "17. Jurisdicción." },
    {
      type: "p",
      text: "En caso de litigios derivados o relacionados con cualquiera de los actos relativos a la reserva o al contrato de alquiler de la autocaravana, se acuerda que la jurisdicción sea la de los Juzgados y Tribunales de la ciudad de Murcia (España).",
    },
    {
      type: "p",
      text: "En el caso de posible discrepancia entre las versiones español/inglés de las presentes condiciones generales, prevalecerá la versión española.",
    },
  ],
};

const PROTECCION_DATOS: ContractDocContent = {
  title: "Anexo específico en materia de protección de datos — Geolocalización de vehículos",
  blocks: [
    {
      type: "p",
      highlight: true,
      text: "Todos los vehículos de FURGOCASA llevan instalado un dispositivo conectado a internet que nos permite recibir cierta información de los mismos, incluyendo datos de geolocalización procedentes de un sistema de posicionamiento global (GPS).",
    },
    {
      type: "p",
      text: "Estos dispositivos instalados, en concreto, recaban y facilitan a FURGOCASA información relativa a:",
    },
    { type: "li", text: "El posicionamiento GPS del vehículo en tiempo real." },
    { type: "li", text: "La situación del vehículo en cuanto a vehículo en marcha, parado o estacionado y apagado." },
    { type: "li", text: "La velocidad actual y media de trayecto." },
    { type: "li", text: "La hora de comienzo, fin y tiempo de duración de trayecto." },
    { type: "li", text: "El itinerario y distancia recorrida." },
    { type: "li", text: "La duración de los periodos de estacionamiento." },
    { type: "li", text: "Los tramos donde se ha superado el límite de velocidad." },
    { type: "li", text: "Información sobre acelerones y frenazos de motor." },
    {
      type: "p",
      text: "La principal razón por la que la empresa ha optado por la instalación de estos dispositivos se asocia a la seguridad del propio vehículo. De esta manera, podremos actuar más rápidamente ante un eventual fraude, robo o apropiación indebida del vehículo. Nuestra intención, en este caso, no es localizar al conductor o a usted, sino proteger nuestros vehículos y el valor de los mismos.",
    },
    {
      type: "p",
      text: "En cualquier caso, el cliente acepta que FURGOCASA pueda hacer uso de tales datos con otros propósitos, siempre ligados a la mejora de la calidad en el servicio y a la mejora competitiva de la empresa en la prestación de los mismos y en el desarrollo de su negocio.",
    },
    {
      type: "p",
      text: "En concreto, el cliente autoriza a FURGOCASA a poder realizar los siguientes usos potenciales de sus datos:",
    },
    {
      type: "li",
      text: "La localización del vehículo ante un eventual desplazamiento no autorizado del mismo derivado de un posible robo o apropiación indebida del vehículo.",
    },
    {
      type: "li",
      text: "El control del cumplimiento de las obligaciones contractuales asumidas o de los posibles usos inapropiados del vehículo realizados por el cliente durante su alquiler.",
    },
    { type: "li", text: "La realización de informes agregados y estadísticos sobre el uso de nuestros vehículos." },
    { type: "li", text: "Para mejorar la calidad de la prestación de servicios y de sus vehículos." },
    { type: "li", text: "Para la realización de promociones y ofertas personalizadas que permitan mejorar la experiencia del cliente." },
    {
      type: "li",
      text: "La cesión de datos a empresas asociadas o a terceras partes con fines lucrativos asociados al tratamiento masivo de información.",
    },
    {
      type: "p",
      text: "Con la firma del presente “Anexo específico en materia de protección de datos” el cliente reconoce expresamente haber leído al detalle todo su contenido, haber sido, en consecuencia, informado de los datos a los que, por medio de los referidos dispositivos de geolocalización, tendrá acceso y custodiará FURGOCASA y, por último, reconoce aceptar el tratamiento de los mismos, así como los diferentes potenciales usos a realizar por dicha entidad previamente expuestos.",
    },
  ],
};

export const CONTRACT_CONTENT: Record<string, ContractDocContent> = {
  "condiciones-alquiler": CONDICIONES,
  "proteccion-datos": PROTECCION_DATOS,
};
