use serde::Serialize;
use similar::{Algorithm, ChangeTag, TextDiff};

#[derive(Serialize)]
pub struct DiffSegment {
    text: String,
    kind: String,
}

#[derive(Serialize)]
pub struct DiffLine {
    segments: Vec<DiffSegment>,
    changed: bool,
}

#[derive(Serialize)]
pub struct DiffResult {
    left: Vec<DiffLine>,
    right: Vec<DiffLine>,
}

#[tauri::command]
pub fn diff_texts(left: String, right: String) -> DiffResult {
    // Keep line numbers stable: line N always compares with line N.
    // This avoids row inflation when diff algorithm re-groups long blank ranges.
    let left_lines: Vec<&str> = left.split('\n').collect();
    let right_lines: Vec<&str> = right.split('\n').collect();
    let max_len = left_lines.len().max(right_lines.len());

    let mut marked_left: Vec<DiffLine> = Vec::with_capacity(max_len);
    let mut marked_right: Vec<DiffLine> = Vec::with_capacity(max_len);

    for i in 0..max_len {
        let left_text = left_lines.get(i).copied().unwrap_or("");
        let right_text = right_lines.get(i).copied().unwrap_or("");
        let changed = left_text != right_text;

        if changed {
            let (left_segments, right_segments) = highlight_line_diff(left_text, right_text);
            marked_left.push(DiffLine {
                segments: left_segments,
                changed: true,
            });
            marked_right.push(DiffLine {
                segments: right_segments,
                changed: true,
            });
        } else {
            let line = left_text.to_string();
            marked_left.push(DiffLine {
                segments: vec![DiffSegment {
                    text: line.clone(),
                    kind: "equal".to_string(),
                }],
                changed: false,
            });
            marked_right.push(DiffLine {
                segments: vec![DiffSegment {
                    text: line,
                    kind: "equal".to_string(),
                }],
                changed: false,
            });
        }
    }

    debug_assert_eq!(marked_left.len(), marked_right.len());

    DiffResult {
        left: marked_left,
        right: marked_right,
    }
}


/// 对两个字符串进行字符级对比，返回左右侧 token 片段
fn highlight_line_diff(left: &str, right: &str) -> (Vec<DiffSegment>, Vec<DiffSegment>) {
    let diff = TextDiff::configure()
        .algorithm(Algorithm::Myers)
        .diff_chars(left, right);

    let mut left_segments = Vec::new();
    let mut right_segments = Vec::new();

    for change in diff.iter_all_changes() {
        match change.tag() {
            ChangeTag::Equal => {
                push_segment(&mut left_segments, "equal", change.value());
                push_segment(&mut right_segments, "equal", change.value());
            }
            ChangeTag::Delete => {
                push_segment(&mut left_segments, "delete", change.value());
            }
            ChangeTag::Insert => {
                push_segment(&mut right_segments, "insert", change.value());
            }
        }
    }

    (left_segments, right_segments)
}

fn push_segment(segments: &mut Vec<DiffSegment>, kind: &str, text: &str) {
    if text.is_empty() {
        return;
    }

    if let Some(last) = segments.last_mut() {
        if last.kind == kind {
            last.text.push_str(text);
            return;
        }
    }

    segments.push(DiffSegment {
        text: text.to_string(),
        kind: kind.to_string(),
    });
}
