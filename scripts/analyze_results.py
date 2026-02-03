
import sys
import argparse
import re
import os
from collections import defaultdict

def parse_log_entry(line):
    """Parses a single log line and returns a dictionary."""
    match = re.match(r"^\[(.*?)\] \| (.*?) \| (.*?) \| (.*?) \| (.*)$", line)
    if match:
        return {
            "timestamp": match.group(1),
            "test_name": match.group(2),
            "variant_id": match.group(3),
            "event_type": match.group(4),
            "session_id": match.group(5),
        }
    return None

def aggregate_metrics(log_file_path, target_test_name):
    """Aggregates views and CTA clicks (conversions) for each variant across unique sessions."""
    metrics = defaultdict(lambda: {"views": 0, "cta_clicks": 0})
    # Use unique_sessions to ensure each session_id only counts once for a 'VIEW' event per variant
    unique_sessions = defaultdict(set)

    try:
        with open(log_file_path, "r") as f:
            for line in f:
                entry = parse_log_entry(line.strip())
                if entry and entry["test_name"] == target_test_name:
                    variant_id = entry["variant_id"]
                    session_id = entry["session_id"]
                    event_type = entry["event_type"]

                    if event_type == "VIEW":
                        # Only count a view if this session hasn't viewed this variant before
                        if session_id not in unique_sessions[variant_id]:
                            metrics[variant_id]["views"] += 1
                            unique_sessions[variant_id].add(session_id)
                    elif event_type == "CTA_CLICK":
                        metrics[variant_id]["cta_clicks"] += 1
    except FileNotFoundError:
        print(f"Error: Log file not found at {log_file_path}")
        exit(1)
    return metrics

def calculate_conversion_rates(metrics):
    """Calculates Click-Through Rates (CTR) for each variant."""
    results = {}
    for variant_id, data in metrics.items():
        views = data["views"]
        cta_clicks = data["cta_clicks"]
        # In this context, CTA Clicks / Views is the CTR
        ctr = (cta_clicks / views * 100) if views > 0 else 0
        results[variant_id] = {
            "views": views,
            "cta_clicks": cta_clicks,
            "ctr": ctr, # Renamed from conversion_rate to ctr
        }
    return results

def generate_html_report(test_name, results):
    """Generates an HTML report for the A/B test results."""
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>A/B Test Report: {test_name}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }}
            .container {{ max-width: 900px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            h1, h2 {{ color: #0056b3; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 10px; text-align: left; }}
            th {{ background-color: #e9e9e9; font-weight: bold; }}
            .green {{ color: #28a745; font-weight: bold; }}
            .red {{ color: #dc3545; font-weight: bold; }}
            .neutral {{ color: #6c757d; }}
            .recommendations {{ margin-top: 30px; padding: 15px; background-color: #e6f7ff; border-left: 5px solid #007bff; }}
            .bar-chart {{ margin-top: 20px; }}
            .bar-chart-row {{ display: flex; align-items: center; margin-bottom: 5px; }}
            .bar-chart-label {{ width: 150px; flex-shrink: 0; }}
            .bar {{ height: 20px; background-color: #007bff; margin-right: 10px; }}
            .bar-value {{ font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>A/B Test Report: {test_name}</h1>
    """

    if not results:
        html_content += "<p>No data found for this test name.</p>"
    else:
        # Summary Table
        html_content += "<h2>Summary of Results</h2>"
        html_content += "<table>"
        html_content += "<thead><tr><th>Metric</th>"
        variant_ids = sorted(results.keys())
        for vid in variant_ids:
            html_content += f"<th>{vid}</th>"
        html_content += "</tr></thead><tbody>"

        # Find the best variant for visual indication
        best_variant = None
        highest_ctr = -1
        if results:
            for variant_id, data in results.items():
                if data["ctr"] > highest_ctr:
                    highest_ctr = data["ctr"]
                    best_variant = variant_id

        # Views Row
        html_content += "<tr><td>Views</td>"
        for vid in variant_ids:
            html_content += f"<td>{results[vid]['views']}</td>"
        html_content += "</tr>"

        # CTA Clicks Row
        html_content += "<tr><td>CTA Clicks</td>"
        for vid in variant_ids:
            html_content += f"<td>{results[vid]['cta_clicks']}</td>"
        html_content += "</tr>"

        # CTR Row with visual indicators
        html_content += "<tr><td>CTR</td>" # Renamed from Conversion Rate to CTR
        for vid in variant_ids:
            ctr = results[vid]['ctr'] # Renamed from conversion_rate to ctr
            color_class = "neutral"
            if best_variant and vid == best_variant:
                color_class = "green"
            elif highest_ctr > 0 and ctr < highest_ctr: # Using highest_ctr
                color_class = "red"
            
            html_content += f"<td class='{color_class}'>{ctr:.2f}%</td>"
        html_content += "</tr>"
        html_content += "</tbody></table>"

        # Bar Charts for Views and Conversion Rate
        html_content += "<h2>Visualizations</h2>"

        # Views Bar Chart
        html_content += "<h3>Views Comparison</h3>"
        html_content += "<div class='bar-chart'>"
        views_values = [results[vid]['views'] for vid in variant_ids]
        max_views = max(views_values) if views_values else 0
        for i, vid in enumerate(variant_ids):
            views = views_values[i]
            bar_width = (views / max_views * 100) if max_views > 0 else 0
            html_content += f"""
            <div class="bar-chart-row">
                <span class="bar-chart-label">{vid}</span>
                <div class="bar" style="width: {bar_width:.2f}%;"></div>
                <span class="bar-value">{views}</span>
            </div>
            """
        html_content += "</div>"

        # CTR Bar Chart
        html_content += "<h3>CTR Comparison</h3>" # Renamed from Conversion Rate Comparison to CTR Comparison
        html_content += "<div class='bar-chart'>"
        ctr_values = [results[vid]['ctr'] for vid in variant_ids] # Renamed from conv_values to ctr_values and uses 'ctr'
        max_ctr = max(ctr_values) if ctr_values else 0
        for i, vid in enumerate(variant_ids):
            ctr_rate = ctr_values[i] # Renamed from conv_rate to ctr_rate
            bar_width = (ctr_rate / max_ctr * 100) if max_ctr > 0 else 0
            html_content += f"""
            <div class="bar-chart-row">
                <span class="bar-chart-label">{vid}</span>
                <div class="bar" style="width: {bar_width:.2f}%;"></div>
                <span class="bar-value">{ctr_rate:.2f}%</span>
            </div>
            """
        html_content += "</div>"


        # Recommendations
        html_content += """
            <div class="recommendations">
                <h2>Recommendations</h2>
        """
        best_variant = None
        highest_ctr = -1 # Renamed highest_conversion to highest_ctr

        for variant_id, data in results.items():
            if data["ctr"] > highest_ctr: # Using 'ctr'
                highest_ctr = data["ctr"] # Using 'ctr'
                best_variant = variant_id
            elif data["ctr"] == highest_ctr: # Handle ties (using 'ctr')
                if best_variant is None:
                    best_variant = variant_id
                else:
                    best_variant += f" and {variant_id}"

        if best_variant:
            html_content += f"<p>Based on CTR, '<strong>{best_variant}</strong>' is the best-performing variant with a CTR of <strong>{highest_ctr:.2f}%</strong>.</p>" # Using 'CTR' and 'highest_ctr'
            html_content += "<p>Consider deploying this variant or further investigating its characteristics (e.g., CTA phrasing, content length, tone of voice) to understand why it performed better.</p>"
        else:
            html_content += "<p>Unable to determine a best-performing variant or no conversion data available.</p>"
        html_content += "<p><em>Important Note: These are simulated results based on mock data. In a real-world A/B test, proper statistical significance testing would be crucial before making any deployment decisions.</em></p>"
        html_content += "</div>"

    html_content += """
        </div>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze A/B test metrics from a log file and generate an HTML report.")
    parser.add_argument("test_name", help="The name of the A/B test to analyze (e.g., 'test_name_1').")
    parser.add_argument("--log_file", default="localcontent_ai/ab_test_metrics.log",
                        help="Path to the A/B test metrics log file.")
    args = parser.parse_args()

    # 1. Parse ab_test_metrics.log and 2. Aggregate metrics
    aggregated_data = aggregate_metrics(args.log_file, args.test_name)
    results = calculate_conversion_rates(aggregated_data)

    # 3. Generate and save the HTML report
    report_html = generate_html_report(args.test_name, results)
    
    output_dir = "localcontent_ai/ab_tests/results"
    os.makedirs(output_dir, exist_ok=True)
    report_file_path = os.path.join(output_dir, f"{args.test_name}_report.html")

    with open(report_file_path, "w") as f:
        f.write(report_html)
    
    print(f"A/B test report saved to: {report_file_path}")

    # Remove existing print functions for output
    # print_summary_table(args.test_name, results)
    # if results:
    #     print_bar_chart(results, "views", "Views")
    #     print_bar_chart(results, "ctr", "CTR") # Renamed from conversion_rate to ctr
    # provide_recommendations(results)
