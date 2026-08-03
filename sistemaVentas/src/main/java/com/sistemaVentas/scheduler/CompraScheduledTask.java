package com.sistemaVentas.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.sistemaVentas.business.CompraService;

@Component
public class CompraScheduledTask {

    private static final Logger logger = LoggerFactory.getLogger(CompraScheduledTask.class);

    @Autowired
    private CompraService compraService;

    /**
     * Se ejecuta diariamente a la 1:00 AM y también cada 5 minutos en entorno de demostración
     * para verificar automáticamente órdenes en estado PENDIENTE cuyo stock debe liberarse
     * e incrementarse en la Fecha de Entrega ("Just-in-Time").
     */
    @Scheduled(cron = "0 0 1 * * ?") // Ejecución diaria a la 1:00 AM
    @Scheduled(fixedRate = 300000)   // Ejecución periódica de control cada 5 minutos (300,000 ms)
    public void procesarEntregasProgramadas() {
        logger.info("⏳ [SCHEDULED COMPRAS] Iniciando verificación diferida de entregas de compras...");
        try {
            int procesadas = compraService.procesarEntregasPendientes();
            if (procesadas > 0) {
                logger.info("✅ [SCHEDULED COMPRAS] Éxito: Se procesaron {} órdenes de compra pendientes a estado RECIBIDO y el stock fue actualizado.", procesadas);
            } else {
                logger.info("ℹ️ [SCHEDULED COMPRAS] Sin novedades: No se encontraron órdenes pendientes vencidas para procesamiento.");
            }
        } catch (Exception e) {
            logger.error("❌ [SCHEDULED COMPRAS] Error crítico durante la verificación de entregas diferidas: {}", e.getMessage(), e);
        }
    }
}
