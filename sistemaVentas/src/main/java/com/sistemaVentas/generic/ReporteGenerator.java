package com.sistemaVentas.generic;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Component
public class ReporteGenerator {

    public byte[] generarReportePdf(String nombreReporte, Map<String, Object> parametros, List<?> datos)
            throws Exception {
        InputStream stream = getClass().getResourceAsStream("/reportes/" + nombreReporte + ".jrxml");
        JasperReport report = JasperCompileManager.compileReport(stream);
        JasperPrint print = JasperFillManager.fillReport(report, parametros, new JRBeanCollectionDataSource(datos));
        return JasperExportManager.exportReportToPdf(print);
    }
}